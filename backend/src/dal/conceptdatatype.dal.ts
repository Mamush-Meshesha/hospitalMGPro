import { prisma } from '../utils/prisma';

export class ConceptdatatypeDAL {
  static async getAll() {
    return await prisma.concept_datatype.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.concept_datatype.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.concept_datatype.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.concept_datatype.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Soft Delete (Metadata)
    return await prisma.concept_datatype.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }
}
