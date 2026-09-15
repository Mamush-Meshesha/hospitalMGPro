import { prisma } from '../utils/prisma';

export class MedicationdispenseDAL {
  static async getAll() {
    return await prisma.medication_dispense.findMany({ take: 50 });
  }

  static async getById(id: string) {
    return await prisma.medication_dispense.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    // Note: UUID resolution logic for nested entities (like patient_uuid -> patient_id) 
    // will be injected at the service level. This handles raw inserts.
    return await prisma.medication_dispense.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.medication_dispense.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Soft Delete (Clinical Data)
    return await prisma.medication_dispense.updateMany({ 
      where: { uuid: id }, 
      data: { voided: true, date_voided: new Date(), voided_by: 1 } 
    });
  }
}
