import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export class RelationshipDAL {
  /**
   * Bidirectional Relationship Engine
   * Securely maps Person A to Person B using the appropriate Relationship Type
   */
  static async createRelationship(personAUuid: string, personBUuid: string, relationshipTypeUuid: string, creatorId: number) {
    return await prisma.$transaction(async (tx) => {
      const personA = await tx.person.findFirst({ where: { uuid: personAUuid } });
      const personB = await tx.person.findFirst({ where: { uuid: personBUuid } });
      const relType = await tx.relationship_type.findFirst({ where: { uuid: relationshipTypeUuid } });

      if (!personA || !personB || !relType) {
        throw new Error("Invalid UUIDs for creating a relationship");
      }

      const existing = await tx.relationship.findFirst({
        where: {
          person_a: personA.person_id,
          person_b: personB.person_id,
          relationship: relType.relationship_type_id,
          voided: false
        }
      });

      if (existing) return existing;

      return await tx.relationship.create({
        data: {
          person_a: personA.person_id,
          person_b: personB.person_id,
          relationship: relType.relationship_type_id,
          start_date: new Date(),
          creator: creatorId,
          date_created: new Date(),
          voided: false,
          uuid: generateUuid()
        }
      });
    });
  }

  static async getPatientRelationships(personUuid: string) {
    const person = await prisma.person.findFirst({ where: { uuid: personUuid } });
    if (!person) return [];

    return await prisma.relationship.findMany({
      where: {
        OR: [
          { person_a: person.person_id },
          { person_b: person.person_id }
        ],
        voided: false
      },
      include: {
        person_person_a_is_person: { include: { reverse_person_name_name_for_person: true } },
        person_person_b_is_person: { include: { reverse_person_name_name_for_person: true } },
        relationship_type_relationship_type_id: true
      }
    });
  }
}
