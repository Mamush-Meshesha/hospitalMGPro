import { prisma } from '../utils/prisma';

export class ConceptstateconversionDAL {
  static async getAll() {
    return await prisma.concept_state_conversion.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.concept_state_conversion.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.concept_state_conversion.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.concept_state_conversion.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Hard Delete
    return await prisma.concept_state_conversion.deleteMany({ where: { uuid: id } });
  }
}
