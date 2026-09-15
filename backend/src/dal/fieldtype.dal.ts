import { prisma } from '../utils/prisma';

export class FieldtypeDAL {
  static async getAll() {
    return await prisma.field_type.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.field_type.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.field_type.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.field_type.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Hard Delete
    return await prisma.field_type.deleteMany({ where: { uuid: id } });
  }
}
