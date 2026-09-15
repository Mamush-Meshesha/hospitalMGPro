import { VisittypeDAL } from '../dal/visittype.dal';

export class VisittypeService {
  static async getAll() {
    return await VisittypeDAL.getAll();
  }

  static async getById(id: string) {
    return await VisittypeDAL.getById(id);
  }

  static async create(data: any) {
    return await VisittypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await VisittypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await VisittypeDAL.remove(id);
  }
}
