import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export interface CreateObsInput {
  personUuid: string;
  conceptId: number;
  encounterUuid?: string;
  obsDatetime: string;
  locationId?: number;
  valueNumeric?: number;
  valueText?: string;
  valueCodedId?: number;
  valueDatetime?: string;
  comment?: string;
  creatorId: number;
}

export class ObsDAL {
  static async getAll(privileges?: string[], authLocationId?: number) {
    const where: any = { voided: false };

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
        person_person_obs: {
          include: {
            reverse_person_name_name_for_person: { where: { preferred: true } }
          }
        },
        concept_obs_concept: true,
      },
      orderBy: { obs_datetime: 'desc' },
      take: 100
    });
  }

  static async getById(id: string) {
    return await prisma.obs.findFirst({
      where: { uuid: id, voided: false },
      include: {
        person_person_obs: true,
        concept_obs_concept: true,
        encounter_encounter_observations: true,
      }
    });
  }

  /**
   * Create a clinical observation mapped to the OpenMRS obs table.
   * Supports all value types: numeric, text, coded, datetime.
   */
  static async create(input: CreateObsInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Resolve Person UUID
      const person = await tx.person.findFirst({ where: { uuid: input.personUuid } });
      if (!person) throw new Error(`Person with UUID ${input.personUuid} not found`);

      // 2. Optionally resolve Encounter UUID
      let encounterId: number | null = null;
      if (input.encounterUuid) {
        const encounter = await tx.encounter.findFirst({ where: { uuid: input.encounterUuid } });
        encounterId = encounter?.encounter_id ?? null;
      }

      // 3. Create the Observation
      const obs = await tx.obs.create({
        data: {
          person_id: person.person_id,
          concept_id: input.conceptId,
          encounter_id: encounterId,
          obs_datetime: new Date(input.obsDatetime),
          location_id: input.locationId ?? null,
          value_numeric: input.valueNumeric ?? null,
          value_text: input.valueText ?? null,
          value_coded: input.valueCodedId ?? null,
          value_datetime: input.valueDatetime ? new Date(input.valueDatetime) : null,
          comments: input.comment ?? null,
          status: 'FINAL',
          creator: input.creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid(),
        }
      });

      return obs;
    });
  }

  static async update(id: string, data: any) {
    return await prisma.obs.updateMany({ where: { uuid: id, voided: false }, data });
  }

  static async remove(id: string, voidedBy: number = 1) {
    return await prisma.obs.updateMany({
      where: { uuid: id },
      data: { voided: true, date_voided: new Date(), voided_by: voidedBy, void_reason: 'Voided via API' }
    });
  }

  static async getByEncounter(encounterUuid: string) {
    const encounter = await prisma.encounter.findFirst({ where: { uuid: encounterUuid } });
    if (!encounter) return [];
    return await prisma.obs.findMany({
      where: { encounter_id: encounter.encounter_id, voided: false },
      include: { concept_obs_concept: true },
      orderBy: { obs_datetime: 'desc' }
    });
  }

  static async getByPerson(personUuid: string, privileges?: string[], authLocationId?: number) {
    const person = await prisma.person.findFirst({ where: { uuid: personUuid } });
    if (!person) return [];

    const where: any = { person_id: person.person_id, voided: false };

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
      include: { concept_obs_concept: true, encounter_encounter_observations: true },
      orderBy: { obs_datetime: 'desc' },
      take: 50
    });
  }
}
