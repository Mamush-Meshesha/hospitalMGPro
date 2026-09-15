import { FieldDAL } from '../dal/field.dal';

export class FieldService {
  static async getAll() {
    return await FieldDAL.getAll();
  }

  static async getById(id: string) {
    return await FieldDAL.getById(id);
  }

  static async create(data: any) {
    return await FieldDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await FieldDAL.update(id, data);
  }

  static async remove(id: string) {
    return await FieldDAL.remove(id);
  }
}
