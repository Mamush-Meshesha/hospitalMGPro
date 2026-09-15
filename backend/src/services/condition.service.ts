import { ConditionDAL } from '../dal/condition.dal';

export class ConditionService {
  static async getAll() {
    return await ConditionDAL.getAll();
  }

  static async getById(id: string) {
    return await ConditionDAL.getById(id);
  }

  static async create(data: any) {
    return await ConditionDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConditionDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConditionDAL.remove(id);
  }
}
