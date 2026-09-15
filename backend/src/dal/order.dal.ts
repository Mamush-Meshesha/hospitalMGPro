import crypto from 'crypto';
import { IntegrationService } from '../services/integration.service';
import { CdsService } from '../services/cds.service';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export class OrderDAL {
  static async getAll(patientUuid?: string, privileges?: string[]) {
    const where: any = {};
    if (patientUuid) {
      const patient = await prisma.patient.findFirst({ where: { person_person_id_for_patient: { uuid: patientUuid } } });
      if (patient) {
        where.patient_id = patient.patient_id;
      }
    }

    if (privileges) {
      // System Admins bypass departmental silos
      const isAdmin = privileges.includes('Super Admin') || privileges.includes('System Developer');
      
      if (!isAdmin) {
        const allowedTypes: string[] = [];
        // If they have VIEW_ORDERS, they see everything (General Doctor)
        if (!privileges.includes('VIEW_ORDERS')) {
          if (privileges.includes('VIEW_LAB')) allowedTypes.push('Test', 'Lab', 'Laboratory', 'Lab Test');
          if (privileges.includes('VIEW_PHARMACY')) allowedTypes.push('Drug', 'Pharmacy');
          
          if (allowedTypes.length > 0) {
            where.order_type_type_of_order = {
              name: { in: allowedTypes }
            };
          } else {
            // No relevant privileges, return nothing
            return [];
          }
        }
      }
    }
    const orders = await prisma.orders.findMany({
      where,
      include: {
        reverse_drug_order_extends_order: {
          include: { drug_inventory_item: true }
        },
        reverse_test_order_test_order_order_id_fk: true,
        order_type_type_of_order: true,
        patient_order_for_patient: {
          include: {
            person_person_id_for_patient: {
              include: {
                reverse_person_name_name_for_person: { where: { preferred: true } }
              }
            },
            reverse_patient_identifier_fk_patient_id_patient_identifier: {
              where: { voided: false }
            }
          }
        },
        reverse_obs_obs_order: {
          orderBy: { date_created: 'desc' }
        }
      },
      orderBy: { date_created: 'desc' },
      take: 50
    });

    if (orders.length === 0) return [];

    const conceptIds = Array.from(new Set(orders.map(o => o.concept_id)));
    const concepts = await prisma.concept.findMany({
      where: { concept_id: { in: conceptIds } },
      include: { reverse_concept_name_name_for_concept: { where: { voided: false } } }
    });

    const conceptMap = new Map(concepts.map(c => [c.concept_id, c]));

    return orders.map(order => ({
      ...order,
      concept: conceptMap.get(order.concept_id) || null
    }));
  }

  static async getById(id: string) {
    const order = await prisma.orders.findFirst({ 
      where: { uuid: id },
      include: {
        reverse_test_order_test_order_order_id_fk: true,
        order_type_type_of_order: true,
        patient_order_for_patient: {
          include: {
            person_person_id_for_patient: {
              include: {
                reverse_person_name_name_for_person: { where: { preferred: true } }
              }
            },
            reverse_patient_identifier_fk_patient_id_patient_identifier: {
              where: { voided: false }
            }
          }
        },
        provider_fk_orderer_provider: {
          include: { person_provider_person_id_fk: { include: { reverse_person_name_name_for_person: { where: { preferred: true } } } } }
        },
        reverse_obs_obs_order: {
          orderBy: { date_created: 'desc' }
        }
      }
    });

    if (!order) return null;

    const concept = await prisma.concept.findUnique({
      where: { concept_id: order.concept_id },
      include: { reverse_concept_name_name_for_concept: { where: { voided: false } } }
    });

    return {
      ...order,
      concept
    };
  }

  /**
   * CPOE: Computerized Provider Order Entry Routing Engine
   * Securely routes an order to either the Pharmacy or the Lab.
   */
  static async placeOrder(data: any, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      // Resolve UUIDs to internal integer primary keys
      const patient = await tx.patient.findFirst({ where: { person_person_id_for_patient: { uuid: data.patientUuid } } });
      const orderer = await tx.provider.findFirst({ where: { uuid: data.ordererUuid } });
      
      let encounter = null;
      if (data.encounterUuid) {
        encounter = await tx.encounter.findFirst({ where: { uuid: data.encounterUuid } });
      } else if (patient) {
        // Production: Auto-create a "Lab Visit" encounter if a standalone order is created without an encounter
        encounter = await tx.encounter.create({
          data: {
            patient_id: patient.patient_id,
            encounter_type: 1, // 1 = General Visit
            encounter_datetime: new Date(),
            creator: creatorId,
            date_created: new Date(),
            uuid: generateUuid(),
            voided: false
          }
        });
      }

      const concept = await tx.concept.findFirst({ where: { uuid: data.conceptUuid } });

      if (!patient || !orderer || !encounter || !concept) {
        throw new Error("One or more related entities (Patient, Provider, Encounter, Concept) not found via UUID.");
      }

      // Default order type if not provided (assume 1 = Drug, 2 = Test based on payload)
      let orderTypeId = data.orderTypeId || (data.drugUuid ? 1 : 2);
      let careSettingId = data.careSettingId || 1; // Default outpatient

      // 1. Create Base Order
      const baseOrder = await tx.orders.create({
        data: {
          patient_id: patient.patient_id,
          orderer: orderer.provider_id,
          encounter_id: encounter.encounter_id,
          concept_id: concept.concept_id,
          order_type_id: orderTypeId,
          care_setting: careSettingId,
          urgency: data.urgency || "ROUTINE",
          order_action: "NEW",
          order_number: `ORD-${Date.now()}`,
          instructions: data.instructions,
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
        }
      });

      // 2. Route to Pharmacy (drug_order)
      if (data.drugOrderDetails || data.drugUuid) {
        let drugId = null;
        if (data.drugUuid) {
          const drug = await tx.drug.findFirst({ where: { uuid: data.drugUuid } });
          if (drug) {
            drugId = drug.drug_id;
            // CDS Validation: Check for lethal allergies
            await CdsService.checkDrugAllergies(patient.patient_id, drug.drug_id);
          }
        }

        await tx.drug_order.create({
          data: {
            order_id: baseOrder.order_id,
            drug_inventory_id: drugId,
            dose: data.drugOrderDetails?.dose || data.dose,
            dosing_instructions: data.drugOrderDetails?.dosingInstructions || data.dosingInstructions,
            dispense_as_written: data.drugOrderDetails?.dispenseAsWritten || data.dispenseAsWritten || false,
          }
        });
      }

      // 3. Route to Lab (test_order)
      if (data.testOrderDetails) {
        let targetLocationId = null;
        if (data.testOrderDetails.targetLabConceptUuid) {
          const targetLabConcept = await tx.concept.findFirst({ where: { uuid: data.testOrderDetails.targetLabConceptUuid }});
          targetLocationId = targetLabConcept?.concept_id || null;
        }

        await tx.test_order.create({
          data: {
            order_id: baseOrder.order_id,
            clinical_history: data.testOrderDetails.clinicalHistory,
            location: targetLocationId
          }
        });
      }

      return baseOrder;
    });
  }

  /**
   * Dedicated Pharmacy Dispensing Queue
   */
  static async getPharmacyQueue() {
    // Fetch all orders that are Drug Orders (order_type_id = 1) and not voided/stopped
    const orders = await prisma.orders.findMany({
      where: {
        voided: false,
        date_stopped: null,
        reverse_drug_order_extends_order: {
          some: {} // Must have an attached drug order record
        }
      },
      include: {
        reverse_drug_order_extends_order: {
          include: { drug_inventory_item: true }
        },
        patient_order_for_patient: {
          include: {
            person_person_id_for_patient: {
              include: {
                reverse_person_name_name_for_person: { where: { preferred: true } }
              }
            }
          }
        },
        provider_fk_orderer_provider: {
          include: { person_provider_person_id_fk: { include: { reverse_person_name_name_for_person: { where: { preferred: true } } } } }
        }
      },
      orderBy: { date_created: 'asc' }
    });

    if (orders.length === 0) return [];

    const conceptIds = Array.from(new Set(orders.map(o => o.concept_id)));
    const concepts = await prisma.concept.findMany({
      where: { concept_id: { in: conceptIds } },
      include: { reverse_concept_name_name_for_concept: { where: { voided: false } } }
    });

    const conceptMap = new Map(concepts.map(c => [c.concept_id, c]));

    return orders.map(order => ({
      ...order,
      concept: conceptMap.get(order.concept_id) || null
    }));
  }

  static async update(id: string, data: any) {
    return await prisma.orders.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    return await prisma.orders.updateMany({
      where: { uuid: id },
      data: { voided: true, date_voided: new Date(), voided_by: 1 }
    });
  }

  /**
   * Dispensary Engine: Fulfills a drug order and triggers ERP Stock Webhook
   */
  static async dispense(orderUuid: string, quantityDispensed: number) {
    return await prisma.$transaction(async (tx) => {
      // Find the base order and include the drug_order
      const order = await tx.orders.findFirst({
        where: { uuid: orderUuid },
        include: { reverse_drug_order_extends_order: true }
      });

      if (!order || order.reverse_drug_order_extends_order.length === 0) {
        throw new Error("Drug order not found or invalid UUID.");
      }

      const drugOrder = order.reverse_drug_order_extends_order[0];

      // Mark order as fulfilled (stopped)
      const updatedOrder = await tx.orders.update({
        where: { order_id: order.order_id },
        data: { date_stopped: new Date() }
      });

      // Trigger Webhook if there is a drug mapped
      if (drugOrder.drug_inventory_id) {
        IntegrationService.triggerStockDeduction(order.uuid, drugOrder.drug_inventory_id, quantityDispensed);
      }

      return updatedOrder;
    });
  }

  /**
   * Enter Lab Results
   */
  static async enterLabResult(orderUuid: string, data: any, userId: number) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findFirst({
        where: { uuid: orderUuid },
        include: { reverse_test_order_test_order_order_id_fk: true }
      });

      if (!order || order.reverse_test_order_test_order_order_id_fk.length === 0) {
        throw new Error("Lab order not found or invalid UUID.");
      }

      // Update order as fulfilled
      const updatedOrder = await tx.orders.update({
        where: { order_id: order.order_id },
        data: {
          fulfiller_status: 'COMPLETED',
          date_stopped: new Date(),
          fulfiller_comment: data.comments || null
        }
      });

      // Create an 'obs' record for the result
      if (data.resultValue !== undefined && data.resultValue !== null && data.resultValue !== "") {
        const isNumeric = !isNaN(Number(data.resultValue));
        
        await tx.obs.create({
          data: {
            person_id: order.patient_id,
            concept_id: order.concept_id,
            order_id: order.order_id,
            encounter_id: order.encounter_id,
            obs_datetime: new Date(),
            value_numeric: isNumeric ? Number(data.resultValue) : null,
            value_text: !isNumeric ? String(data.resultValue) : null,
            comments: data.comments || null,
            creator: userId,
            date_created: new Date(),
            voided: false,
            uuid: generateUuid(),
            status: 'FINAL'
          }
        });
      }

      return updatedOrder;
    });
  }

  static async uploadRadiologyImage(orderUuid: string, fileUrl: string, userId: number) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.orders.findFirst({
        where: { uuid: orderUuid },
        include: { reverse_test_order_test_order_order_id_fk: true }
      });

      if (!order) throw new Error("Order not found");
      if (order.fulfiller_status && order.fulfiller_status !== 'Scheduled') {
        throw new Error("Order is not in Scheduled state");
      }

      const obsUuid = generateUuid();
      const newObs = await tx.obs.create({
        data: {
          person_id: order.patient_id,
          concept_id: order.concept_id,
          order_id: order.order_id,
          obs_datetime: new Date(),
          value_complex: fileUrl,
          creator: userId,
          date_created: new Date(),
          voided: false,
          uuid: obsUuid,
          status: 'FINAL',
        }
      });

      const updatedOrder = await tx.orders.update({
        where: { order_id: order.order_id },
        data: {
          fulfiller_status: 'Images Available',
        }
      });

      return { order: updatedOrder, obs: newObs };
    });
  }
}
