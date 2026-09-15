import { prisma } from '../utils/prisma';

export class Hl7sourceDAL {
  static async getAll() {
    return await prisma.hl7_source.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.hl7_source.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.hl7_source.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.hl7_source.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Hard Delete
    return await prisma.hl7_source.deleteMany({ where: { uuid: id } });
  }
}
