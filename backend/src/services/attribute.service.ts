import { AttributeDAL } from '../dal/attribute.dal';

export class AttributeService {
  static async getAll() {
    return await AttributeDAL.getAll();
  }

  static async getById(id: string) {
    return await AttributeDAL.getById(id);
  }

  static async create(data: any) {
    return await AttributeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await AttributeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await AttributeDAL.remove(id);
  }
}
