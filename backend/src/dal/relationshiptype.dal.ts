import { prisma } from '../utils/prisma';

export class RelationshiptypeDAL {
  static async getAll() {
    const records = await prisma.relationship_type.findMany({ where: { retired: false }, take: 50 });
    return records.map(r => ({ ...r, name: `${r.a_is_to_b} / ${r.b_is_to_a}` }));
  }

  static async getById(id: string) {
    return await prisma.relationship_type.findFirst({ where: { uuid: id } });
  }

  static async create(data: any) {
    if (data.name) {
      if (data.name.includes(' / ')) {
        const parts = data.name.split(' / ');
        data.a_is_to_b = parts[0].trim();
        data.b_is_to_a = parts[1] ? parts[1].trim() : parts[0].trim();
      } else {
        data.a_is_to_b = data.name;
        data.b_is_to_a = data.name;
      }
      delete data.name;
    }
    if (data.display_name !== undefined) delete data.display_name;
    if (data.preferred === undefined) data.preferred = false;
    if (data.weight === undefined) data.weight = 0;
    if (!data.uuid) data.uuid = require('uuid').v4();
    if (!data.creator) data.creator = 1;
    if (!data.date_created) data.date_created = new Date();
    if (data.retired === undefined) data.retired = false;
    return await prisma.relationship_type.create({ data });
  }

  static async update(id: string, data: any) {
    if (data.name) {
      if (data.name.includes(' / ')) {
        const parts = data.name.split(' / ');
        data.a_is_to_b = parts[0].trim();
        data.b_is_to_a = parts[1] ? parts[1].trim() : parts[0].trim();
      } else {
        data.a_is_to_b = data.name;
        data.b_is_to_a = data.name;
      }
      delete data.name;
    }
    if (data.display_name !== undefined) delete data.display_name;
    return await prisma.relationship_type.updateMany({ where: { uuid: id }, data });
  }

  static async remove(id: string) {
    // Soft Delete (Metadata)
    return await prisma.relationship_type.updateMany({ 
      where: { uuid: id }, 
      data: { retired: true, date_retired: new Date(), retired_by: 1 } 
    });
  }
}
