import { prisma } from '../utils/prisma';

export class ConceptproposalDAL {
  static async getAll() {
    return await prisma.concept_proposal.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.concept_proposal.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.concept_proposal.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.concept_proposal.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Hard Delete
    return await prisma.concept_proposal.deleteMany({ where: { uuid: id } });
  }
}
