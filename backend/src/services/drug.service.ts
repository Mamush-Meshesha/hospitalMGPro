import { DrugDAL } from '../dal/drug.dal';

export class DrugService {
  static async getAll() {
    return await DrugDAL.getAll();
  }

  static async getById(id: string) {
    return await DrugDAL.getById(id);
  }

  static async create(data: any) {
    return await DrugDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await DrugDAL.update(id, data);
  }

  static async remove(id: string) {
    return await DrugDAL.remove(id);
  }
}
