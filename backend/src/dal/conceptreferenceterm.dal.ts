import { prisma } from '../utils/prisma';

export class ConceptreferencetermDAL {
  static async getAll() {
    return await prisma.concept_reference_term.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.concept_reference_term.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.concept_reference_term.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.concept_reference_term.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Soft Delete (Metadata)
    return await prisma.concept_reference_term.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }
}
