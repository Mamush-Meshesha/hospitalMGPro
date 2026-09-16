import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export interface CreateEncounterInput {
  patientUuid: string;
  encounterTypeId: number;
  locationId?: number;
  encounterDatetime: string;
  providerId?: number;
  encounterRoleId?: number;
  creatorId: number;
}

export class EncounterDAL {
  static async getAll(date?: string, queryLocationId?: number, providerId?: number, privileges?: string[], authLocationId?: number) {
    const where: any = { voided: false };
    
    // Apply authorization location filter
    if (privileges) {
      const isAdmin = privileges.includes('Super Admin') || privileges.includes('System Developer');
      if (!isAdmin && authLocationId) {
        where.location_id = authLocationId;
      }
    } else if (authLocationId) {
      where.location_id = authLocationId;
    }

    // Explicit query filter
    if (queryLocationId) {
      where.location_id = queryLocationId;
    }
    if (providerId) {
      where.reverse_encounter_provider_encounter_id_fk = {
        some: { provider_id: providerId }
      };
    }
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.encounter_datetime = { gte: start, lte: end };
      // Exclude inpatient Admission encounters — get the admission type IDs first
      const admissionTypes = await prisma.encounter_type.findMany({
        where: { name: { in: ['Admission', 'Inpatient', 'ADT'] } }
      });
      if (admissionTypes.length > 0) {
        where.encounter_type = { notIn: admissionTypes.map(t => t.encounter_type_id) };
      }
    }
    return await prisma.encounter.findMany({
      where,
      include: {
        patient_encounter_patient: {
          include: {
            person_person_id_for_patient: {
              include: {
                reverse_person_name_name_for_person: { where: { preferred: true, voided: false } }
              }
            }
          }
        },
        encounter_type_encounter_type_id: true,
        location_encounter_location: true,
        reverse_encounter_provider_encounter_id_fk: {
          where: { voided: false },
          include: {
            provider_provider_id_fk: {
              include: {
                person_provider_person_id_fk: {
                  include: { reverse_person_name_name_for_person: { where: { preferred: true }, take: 1 } }
                }
              }
            }
          }
        }
      },
      orderBy: { encounter_datetime: 'desc' },
      take: 200,
    });
  }

  static async getById(id: string) {
    return await prisma.encounter.findFirst({
      where: { uuid: id, voided: false },
      include: {
        patient_encounter_patient: true,
        encounter_type_encounter_type_id: true,
        location_encounter_location: true,
        reverse_encounter_provider_encounter_id_fk: true,
        reverse_obs_encounter_observations: { where: { voided: false }, take: 20 }
      }
    });
  }

  /**
   * Create an Encounter with UUID-based resolution for all related entities.
   */
  static async create(input: CreateEncounterInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Resolve Patient
      const person = await tx.person.findFirst({ where: { uuid: input.patientUuid } });
      if (!person) throw new Error(`Patient with UUID ${input.patientUuid} not found`);
      const patient = await tx.patient.findFirst({ where: { patient_id: person.person_id } });
      if (!patient) throw new Error(`Patient record not found`);

      // 2. Create the Encounter
      const encounter = await tx.encounter.create({
        data: {
          patient_id: patient.patient_id,
          encounter_type: input.encounterTypeId,
          encounter_datetime: new Date(input.encounterDatetime),
          location_id: input.locationId ?? null,
          creator: input.creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
        }
      });

      // 3. Optionally link a Provider via encounter_provider
      if (input.providerId) {
        await tx.encounter_provider.create({
          data: {
            encounter_id: encounter.encounter_id,
            provider_id: input.providerId,
            encounter_role_id: input.encounterRoleId ?? 1,
            creator: input.creatorId,
            date_created: new Date(),
            voided: false,
            uuid: generateUuid(),
          }
        });
      }

      return encounter;
    });
  }

  static async update(id: string, data: any) {
    return await prisma.encounter.updateMany({ where: { uuid: id, voided: false }, data });
  }

  static async remove(id: string, voidedBy: number = 1) {
    return await prisma.encounter.updateMany({
      where: { uuid: id },
      data: { voided: true, date_voided: new Date(), voided_by: voidedBy, void_reason: 'Voided via API' }
    });
  }

  static async getByPatient(patientUuid: string, privileges?: string[], authLocationId?: number) {
    const person = await prisma.person.findFirst({ where: { uuid: patientUuid } });
    if (!person) return [];

    const where: any = { patient_id: person.person_id, voided: false };
    
    if (privileges) {
      const isAdmin = privileges.includes('Super Admin') || privileges.includes('System Developer');
      if (!isAdmin && authLocationId) {
        where.location_id = authLocationId;
      }
    } else if (authLocationId) {
      where.location_id = authLocationId;
    }

    return await prisma.encounter.findMany({
      where,
      include: { encounter_type_encounter_type_id: true, location_encounter_location: true },
      orderBy: { encounter_datetime: 'desc' }
    });
  }
}
