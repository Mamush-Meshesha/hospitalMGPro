import { v4 as uuidv4 } from 'uuid';

import { prisma } from '../utils/prisma';

export class BedTypeDal {
  static async getAll() {
    return await prisma.bed_type.findMany({
      where: { retired: false }
    });
  }

  static async getById(uuid: string) {
    return await prisma.bed_type.findFirst({ where: { uuid, retired: false } });
  }

  static async create(data: any) {
    return await prisma.bed_type.create({
      data: {
        ...data,
        uuid: uuidv4(),
        date_created: new Date(),
        retired: false
      }
    });
  }

  static async update(uuid: string, data: any) {
    const existing = await this.getById(uuid);
    if (!existing) throw new Error('Bed type not found');
    
    return await prisma.bed_type.update({
      where: { bed_type_id: existing.bed_type_id },
      data: {
        ...data,
        date_changed: new Date()
      }
    });
  }

  static async remove(uuid: string, retired_by: number = 1) {
    const existing = await this.getById(uuid);
    if (!existing) throw new Error('Bed type not found');

    return await prisma.bed_type.update({
      where: { bed_type_id: existing.bed_type_id },
      data: {
        retired: true,
        date_retired: new Date(),
        retired_by
      }
    });
  }
}
