import { prisma } from '../utils/prisma';

export class ConceptstopwordDAL {
  static async getAll() {
    return await prisma.concept_stop_word.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.concept_stop_word.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.concept_stop_word.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.concept_stop_word.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Hard Delete
    return await prisma.concept_stop_word.deleteMany({ where: { uuid: id } });
  }
}
