import crypto from 'crypto';

import { prisma } from '../utils/prisma';
const generateUuid = () => crypto.randomUUID();

export class SystemsettingDAL {
  static async getAll() {
    return await prisma.global_property.findMany();
  }

  static async getById(id: string) {
    return await prisma.global_property.findFirst({
      where: { OR: [{ uuid: id }, { property: id }] }
    });
  }

  static async create(data: any) {
    return await prisma.global_property.upsert({
      where: { property: data.property },
      update: {
        property_value: data.property_value,
        description: data.description || null,
        date_changed: new Date()
      },
      create: {
        property: data.property,
        property_value: data.property_value,
        description: data.description || null,
        uuid: data.uuid || generateUuid()
      }
    });
  }

  static async update(id: string, data: any) {
    return await prisma.global_property.updateMany({
      where: { OR: [{ uuid: id }, { property: id }] },
      data: {
        property_value: data.property_value,
        description: data.description,
        date_changed: new Date()
      }
    });
  }

  static async remove(id: string) {
    return await prisma.global_property.deleteMany({
      where: { OR: [{ uuid: id }, { property: id }] }
    });
  }
}
