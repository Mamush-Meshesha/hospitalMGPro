import { prisma } from '../utils/prisma';

export class OrdertypeDAL {
  static async getAll() {
    return await prisma.order_type.findMany({ where: { retired: false }, take: 50 });
  }

  static async getById(id: string) {
    return await prisma.order_type.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    if (!data.uuid) data.uuid = require('uuid').v4();
    if (!data.creator) data.creator = 1;
    if (!data.date_created) data.date_created = new Date();
    if (data.retired === undefined) data.retired = false;
    if (!data.java_class_name) data.java_class_name = "org.openmrs.Order";
    return await prisma.order_type.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.order_type.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Soft Delete (Metadata)
    return await prisma.order_type.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }
}
