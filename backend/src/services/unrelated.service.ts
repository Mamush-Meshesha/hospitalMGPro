import { UnrelatedDAL } from '../dal/unrelated.dal';

export class UnrelatedService {
  static async getAll() {
    return await UnrelatedDAL.getAll();
  }

  static async getById(id: string) {
    return await UnrelatedDAL.getById(id);
  }

  static async create(data: any) {
    return await UnrelatedDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await UnrelatedDAL.update(id, data);
  }

  static async remove(id: string) {
    return await UnrelatedDAL.remove(id);
  }
}
