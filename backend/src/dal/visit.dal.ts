import crypto from 'crypto';
import { IntegrationService } from '../services/integration.service';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export class VisitDAL {
  static async getAll(locationId?: number) {
    const whereClause: any = {};
    if (locationId) {
      whereClause.location_id = locationId;
    }

    return await prisma.visit.findMany({
      where: whereClause,
      include: {
        patient_visit_patient_fk: {
          include: {
            person_person_id_for_patient: {
              include: { reverse_person_name_name_for_person: { where: { preferred: true } } }
            }
          }
        },
        location_visit_location_fk: true
      },
      take: 50 
    });
  }

  static async getById(id: string) {
    return await prisma.visit.findFirst({ where: { uuid: id } });
  }

  /**
   * ADT Engine: Admit Patient
   */
  static async admit(patientUuid: string, locationUuid: string, visitTypeUuid: string, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.findFirst({ where: { person_person_id_for_patient: { uuid: patientUuid } } });
      const location = await tx.location.findFirst({ where: { uuid: locationUuid } });
      const visitType = await tx.visit_type.findFirst({ where: { uuid: visitTypeUuid } });
      
      // We need an encounter type for "Admission"
      let encounterType = await tx.encounter_type.findFirst({ where: { name: 'Admission' } });
      if (!encounterType) {
        encounterType = await tx.encounter_type.create({
          data: { name: 'Admission', description: 'Inpatient Admission', creator: creatorId, date_created: new Date(), retired: false, uuid: generateUuid() }
        });
      }

      if (!patient || !location || !visitType) throw new Error("Invalid UUIDs provided for Admission");

      // 1. Create the Visit (Inpatient Stay)
      const visit = await tx.visit.create({
        data: {
          patient_id: patient.patient_id,
          location_id: location.location_id,
          visit_type_id: visitType.visit_type_id,
          date_started: new Date(),
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });

      // 2. Create the Admission Encounter
      const encounter = await tx.encounter.create({
        data: {
          patient_id: patient.patient_id,
          encounter_type: encounterType.encounter_type_id,
          visit_id: visit.visit_id,
          location_id: location.location_id,
          encounter_datetime: new Date(),
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });

      return { visit, encounter };
    });
  }

  /**
   * ADT Engine: Transfer Patient
   */
  static async transfer(visitUuid: string, newLocationUuid: string, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      const visit = await tx.visit.findFirst({ where: { uuid: visitUuid, voided: false, date_stopped: null } });
      const newLocation = await tx.location.findFirst({ where: { uuid: newLocationUuid } });

      if (!visit || !newLocation) throw new Error("Active visit or new location not found");

      let encounterType = await tx.encounter_type.findFirst({ where: { name: 'Transfer' } });
      if (!encounterType) {
        encounterType = await tx.encounter_type.create({
          data: { name: 'Transfer', description: 'Ward Transfer', creator: creatorId, date_created: new Date(), retired: false, uuid: generateUuid() }
        });
      }

      // 1. Update Visit Location
      const updatedVisit = await tx.visit.update({
        where: { visit_id: visit.visit_id },
        data: { location_id: newLocation.location_id }
      });

      // 2. Create Transfer Encounter
      await tx.encounter.create({
        data: {
          patient_id: visit.patient_id,
          encounter_type: encounterType.encounter_type_id,
          visit_id: visit.visit_id,
          location_id: newLocation.location_id,
          encounter_datetime: new Date(),
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });

      return updatedVisit;
    });
  }

  /**
   * ADT Engine: Update Assignment (Ward/Bed/Provider)
   */
  static async updateAssignment(visitUuid: string, locationUuid: string | null, bedUuid: string | null, providerUuid: string | null, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      const visit = await tx.visit.findFirst({ 
        where: { uuid: visitUuid, voided: false, date_stopped: null },
        include: { reverse_encounter_encounter_visit_id_fk: { orderBy: { encounter_datetime: 'desc' }, take: 1 } }
      });
      if (!visit) throw new Error("Active visit not found");

      const latestEncounter = visit.reverse_encounter_encounter_visit_id_fk[0];
      if (!latestEncounter) throw new Error("No active encounter found for this visit");

      let updatedVisit = visit;

      // 1. Update Location if changed
      if (locationUuid) {
        const newLocation = await tx.location.findFirst({ where: { uuid: locationUuid } });
        if (newLocation && newLocation.location_id !== visit.location_id) {
          updatedVisit = await tx.visit.update({
            where: { visit_id: visit.visit_id },
            data: { location_id: newLocation.location_id }
          }) as any;
        }
      }

      // 2. Update Bed Assignment
      if (bedUuid) {
        const bed = await tx.bed.findFirst({ where: { uuid: bedUuid } });
        if (bed) {
          // Void existing bed assignment map if any
          const existingAssignment = await tx.bed_patient_assignment_map.findFirst({
            where: { patient_id: visit.patient_id, date_stopped: null, voided: false }
          });
          if (existingAssignment && existingAssignment.bed_id !== bed.bed_id) {
            await tx.bed_patient_assignment_map.update({
              where: { bed_patient_assignment_map_id: existingAssignment.bed_patient_assignment_map_id },
              data: { date_stopped: new Date(), voided: true, void_reason: 'Transferred', voided_by: creatorId, date_voided: new Date() }
            });
          }
          if (!existingAssignment || existingAssignment.bed_id !== bed.bed_id) {
            await tx.bed_patient_assignment_map.create({
              data: {
                patient_id: visit.patient_id,
                bed_id: bed.bed_id,
                encounter_id: latestEncounter.encounter_id,
                date_started: new Date(),
                creator: creatorId,
                date_created: new Date(),
                voided: false,
                uuid: generateUuid()
              }
            });
          }
        }
      }

      // 3. Update Provider Assignment
      if (providerUuid) {
        const provider = await tx.provider.findFirst({ where: { uuid: providerUuid } });
        if (provider) {
          let role = await tx.encounter_role.findFirst({ where: { name: 'Attending Physician' } });
          if (!role) {
            role = await tx.encounter_role.create({
              data: { name: 'Attending Physician', description: 'Primary attending provider', creator: creatorId, date_created: new Date(), retired: false, uuid: generateUuid() }
            });
          }
          
          const existingProviderMap = await tx.encounter_provider.findFirst({
            where: { encounter_id: latestEncounter.encounter_id, voided: false }
          });

          if (existingProviderMap && existingProviderMap.provider_id !== provider.provider_id) {
            await tx.encounter_provider.update({
              where: { encounter_provider_id: existingProviderMap.encounter_provider_id },
              data: { voided: true, void_reason: 'Changed Provider', voided_by: creatorId, date_voided: new Date() }
            });
          }

          if (!existingProviderMap || existingProviderMap.provider_id !== provider.provider_id) {
            await tx.encounter_provider.create({
              data: {
                encounter_id: latestEncounter.encounter_id,
                provider_id: provider.provider_id,
                encounter_role_id: role.encounter_role_id,
                creator: creatorId,
                date_created: new Date(),
                voided: false,
                uuid: generateUuid()
              }
            });
          }
        }
      }

      return updatedVisit;
    });
  }

  /**
   * ADT Engine: Discharge Patient
   */
  static async discharge(visitUuid: string, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      const visit = await tx.visit.findFirst({ where: { uuid: visitUuid, voided: false, date_stopped: null } });
      if (!visit) throw new Error("Active visit not found");

      let encounterType = await tx.encounter_type.findFirst({ where: { name: 'Discharge' } });
      if (!encounterType) {
        encounterType = await tx.encounter_type.create({
          data: { name: 'Discharge', description: 'Inpatient Discharge', creator: creatorId, date_created: new Date(), retired: false, uuid: generateUuid() }
        });
      }

      // 1. Close Visit
      const updatedVisit = await tx.visit.update({
        where: { visit_id: visit.visit_id },
        data: { date_stopped: new Date() }
      });

      // 2. Create Discharge Encounter
      await tx.encounter.create({
        data: {
          patient_id: visit.patient_id,
          encounter_type: encounterType.encounter_type_id,
          visit_id: visit.visit_id,
          location_id: visit.location_id,
          encounter_datetime: new Date(),
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });

      // 3. Close any active bed assignments for this patient
      const activeAssignments = await tx.bed_patient_assignment_map.findMany({
        where: { patient_id: visit.patient_id, date_stopped: null, voided: false }
      });
      for (const assignment of activeAssignments) {
        await tx.bed_patient_assignment_map.update({
          where: { bed_patient_assignment_map_id: assignment.bed_patient_assignment_map_id },
          data: { date_stopped: new Date(), changed_by: creatorId, date_changed: new Date() }
        });
        await tx.bed.update({
          where: { bed_id: assignment.bed_id },
          data: { status: 'AVAILABLE' }
        });
      }

      // 4. Trigger ERP Billing Webhook asynchronously
      IntegrationService.triggerBilling(visit.uuid, visit.patient_id, visit.location_id);

      return updatedVisit;
    });
  }

  static async create(data: any) {
    return await prisma.visit.create({ data: { ...data, uuid: generateUuid(), date_created: new Date() } });
  }

  static async update(id: string, data: any) {
    return await prisma.visit.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    return await prisma.visit.updateMany({ 
      where: { uuid: id }, 
      data: { voided: true, date_voided: new Date(), voided_by: 1 } 
    });
  }
}
