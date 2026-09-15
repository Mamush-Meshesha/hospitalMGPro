import { FieldtypeDAL } from '../dal/fieldtype.dal';

export class FieldtypeService {
  static async getAll() {
    return await FieldtypeDAL.getAll();
  }

  static async getById(id: string) {
    return await FieldtypeDAL.getById(id);
  }

  static async create(data: any) {
    return await FieldtypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await FieldtypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await FieldtypeDAL.remove(id);
  }
}
