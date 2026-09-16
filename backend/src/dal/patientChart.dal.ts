import { ImmunizationDAL } from './immunization.dal';
import * as crypto from 'crypto';

import { prisma } from '../utils/prisma';

export class PatientChartDAL {
  static async getPatientVitals(patientId: number, privileges?: string[], authLocationId?: number) {
    // Concept IDs from Phase 4 Seed: 5085 (Sys), 5086 (Dia), 5087 (Pulse), 5088 (Temp), 5092 (SpO2)
    const vitalConcepts = [5085, 5086, 5087, 5088, 5092];

    const where: any = {
      person_id: patientId,
      concept_id: { in: vitalConcepts },
      voided: false
    };

    if (privileges) {
      const isAdmin = privileges.includes('Super Admin') || privileges.includes('System Developer');
      if (!isAdmin && authLocationId) {
        where.OR = [
          { location_id: authLocationId },
          { encounter_encounter_observations: { location_id: authLocationId } }
        ];
      }
    } else if (authLocationId) {
      where.OR = [
        { location_id: authLocationId },
        { encounter_encounter_observations: { location_id: authLocationId } }
      ];
    }

    return await prisma.obs.findMany({
      where,
      include: {
        concept_obs_concept: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        }
      },
      orderBy: { obs_datetime: 'desc' },
      take: 50
    });
  }

  static async addPatientVitals(patientId: number, vitals: { concept_id: number, value_numeric: number }[], creatorId: number = 1) {
    const timestamp = new Date();
    // Assuming status is 'FINAL' and voided is false by default.
    // Need to generate UUID for each
    const uuidv4 = require('crypto').randomUUID;

    const dataToInsert = vitals.map(v => ({
      person_id: patientId,
      concept_id: v.concept_id,
      value_numeric: v.value_numeric,
      obs_datetime: timestamp,
      creator: creatorId,
      date_created: timestamp,
      voided: false,
      uuid: uuidv4(),
      status: 'FINAL'
    }));

    // Use createMany to insert all vitals
    return await prisma.obs.createMany({
      data: dataToInsert
    });
  }

  static async getPatientConditions(patientId: number) {
    return await prisma.conditions.findMany({
      where: {
        patient_id: patientId,
        voided: false
      },
      include: {
        concept_condition_condition_coded_fk: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        }
      },
      orderBy: { date_created: 'desc' }
    });
  }

  static async getPatientAllergies(patientId: number) {
    return await prisma.allergy.findMany({
      where: {
        patient_id: patientId,
        voided: false
      },
      include: {
        concept_allergy_coded_allergen_fk: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        },
        concept_allergy_severity_concept_id_fk: {
          include: {
            reverse_concept_name_name_for_concept: true
          }
        }
      },
      orderBy: { date_created: 'desc' }
    });
  }

  static async getPatientNotes(patientId: number) {
    return await prisma.note.findMany({
      where: {
        patient_id: patientId
      },
      include: {
        users_user_who_created_note: true
      },
      orderBy: { date_created: 'desc' }
    });
  }

  static async getPatientOrders(patientId: number, privileges?: string[], authLocationId?: number) {
    const where: any = {
      patient_id: patientId,
      voided: false
    };

    if (privileges) {
      const isAdmin = privileges.includes('Super Admin') || privileges.includes('System Developer');
      if (!isAdmin && authLocationId) {
        where.patient_order_for_patient = {
          reverse_encounter_encounter_patient: {
            some: { location_id: authLocationId }
          }
        };
      }
    } else if (authLocationId) {
      where.patient_order_for_patient = {
        reverse_encounter_encounter_patient: {
          some: { location_id: authLocationId }
        }
      };
    }

    return await prisma.orders.findMany({
      where,
      include: {
        order_type_type_of_order: true
      },
      orderBy: { date_created: 'desc' }
    });
  }

  static async getFullPatientChart(patientId: number, privileges?: string[], authLocationId?: number) {
    const [vitals, conditions, allergies, notes, orders, immunizations, patient] = await Promise.all([
      this.getPatientVitals(patientId, privileges, authLocationId),
      this.getPatientConditions(patientId),
      this.getPatientAllergies(patientId),
      this.getPatientNotes(patientId),
      this.getPatientOrders(patientId, privileges, authLocationId),
      ImmunizationDAL.getPatientImmunizations(patientId),
      prisma.patient.findFirst({
        where: { patient_id: patientId },
        include: { 
          person_person_id_for_patient: {
            include: { reverse_person_name_name_for_person: true }
          },
          reverse_visit_visit_patient_fk: {
            where: { date_stopped: null, voided: false },
            include: { location_visit_location_fk: true }
          }
        }
      })
    ]);

    return {
      vitals,
      conditions,
      allergies,
      notes,
      orders,
      immunizations,
      patient
    };
  }

  static async addPatientCondition(patientId: number, data: any, creatorId: number) {
    return await prisma.conditions.create({
      data: {
        patient_id: patientId,
        condition_non_coded: data.name,
        clinical_status: data.status,
        additional_detail: data.detail,
        creator: creatorId,
        date_created: new Date(),
        voided: false,
        uuid: crypto.randomUUID()
      }
    });
  }

  static async addPatientAllergy(patientId: number, data: any, creatorId: number) {
    return await prisma.allergy.create({
      data: {
        patient_id: patientId,
        coded_allergen: 2001, // Dummy concept ID for required field
        non_coded_allergen: data.allergen,
        allergen_type: data.type || 'DRUG',
        comments: data.reaction,
        creator: creatorId,
        date_created: new Date(),
        voided: false,
        uuid: crypto.randomUUID()
      }
    });
  }

  static async addPatientNote(patientId: number, data: any, creatorId: number) {
    const maxNote = await prisma.note.aggregate({ _max: { note_id: true } });
    const nextId = (maxNote._max.note_id || 0) + 1;
    
    return await prisma.note.create({
      data: {
        note_id: nextId,
        patient_id: patientId,
        text: data.text,
        creator: creatorId,
        date_created: new Date(),
        uuid: crypto.randomUUID()
      }
    });
  }

  static async addPatientImmunization(patientId: number, data: any, creatorId: number) {
    return await ImmunizationDAL.recordImmunization(
      patientId,
      parseInt(data.conceptId),
      data.dateAdministered ? new Date(data.dateAdministered) : new Date(),
      creatorId
    );
  }

  static async addPatientOrder(patientId: number, data: any, creatorId: number) {
    return await prisma.orders.create({
      data: {
        order_type_id: 2, // 2 = Test order
        concept_id: parseInt(data.conceptId),
        orderer: creatorId,
        encounter_id: 1, // Requires an active encounter in a real app
        instructions: data.instructions,
        date_activated: new Date(),
        creator: creatorId,
        date_created: new Date(),
        voided: false,
        patient_id: patientId,
        uuid: crypto.randomUUID(),
        urgency: data.urgency || 'ROUTINE',
        order_number: `ORD-${Date.now()}`,
        order_action: 'NEW',
        care_setting: 1
      }
    });
  }

  static async addPatientMedication(patientId: number, data: any, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.orders.create({
        data: {
          order_type_id: 1, // 1 = Drug order
          concept_id: parseInt(data.conceptId),
          orderer: creatorId,
          encounter_id: 1,
          date_activated: new Date(),
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          patient_id: patientId,
          uuid: crypto.randomUUID(),
          urgency: 'ROUTINE',
          order_number: `RX-${Date.now()}`,
          order_action: 'NEW',
          care_setting: 1
        }
      });

      await tx.drug_order.create({
        data: {
          order_id: order.order_id,
          dose: parseFloat(data.dose) || null,
          dose_units: data.doseUnits ? parseInt(data.doseUnits) : null,
          frequency: data.frequency ? parseInt(data.frequency) : null,
          route: data.route ? parseInt(data.route) : null,
          duration: data.duration ? parseInt(data.duration) : null,
          dispense_as_written: false
        }
      });

      return order;
    });
  }
}
