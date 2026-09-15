import { prisma } from '../utils/prisma';

export class VisittypeDAL {
  static async getAll() {
    return await prisma.visit_type.findMany({ where: { retired: false }, take: 50 });
  }

  static async getById(id: string) {
    return await prisma.visit_type.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    const { display_name, uuid, ...validData } = data;
    const { v4: uuidv4 } = require('uuid');
    return await prisma.visit_type.create({ 
      data: {
        ...validData,
        uuid: uuidv4(),
        creator: data.creator || 1,
        date_created: new Date(),
        retired: false
      }
    });
  }

  static async update(id: string, data: any) {
    const { display_name, uuid, date_created, creator, retired, ...validData } = data;
    return await prisma.visit_type.updateMany({ 
      where: { uuid: id }, 
      data: { ...validData, date_changed: new Date() } 
    });
  }

  static async remove(id: string) {
    // Soft Delete (Metadata)
    return await prisma.visit_type.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }
}
