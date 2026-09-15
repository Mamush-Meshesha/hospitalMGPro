import { prisma } from '../utils/prisma';

export class OrderfrequencyDAL {
  static async getAll() {
    return await prisma.order_frequency.findMany({ where: { retired: false }, take: 50 });
  }

  static async getById(id: string) {
    return await prisma.order_frequency.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    if (!data.uuid) data.uuid = require('uuid').v4();
    if (!data.creator) data.creator = 1;
    if (!data.date_created) data.date_created = new Date();
    if (data.retired === undefined) data.retired = false;
    if (data.concept_id === undefined) data.concept_id = 1;
    return await prisma.order_frequency.create({ data });
  }

  static async update(id: string, data: any) {
    return await prisma.order_frequency.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Soft Delete (Metadata)
    return await prisma.order_frequency.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }
}
