import { prisma } from '../utils/prisma';

export class FormfieldDAL {
  static async getAll() {
    return await prisma.form_field.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.form_field.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.form_field.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.form_field.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Hard Delete
    return await prisma.form_field.deleteMany({ where: { uuid: id } });
  }
}
