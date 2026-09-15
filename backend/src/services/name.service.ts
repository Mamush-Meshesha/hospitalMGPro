import { NameDAL } from '../dal/name.dal';

export class NameService {
  static async getAll() {
    return await NameDAL.getAll();
  }

  static async getById(id: string) {
    return await NameDAL.getById(id);
  }

  static async create(data: any) {
    return await NameDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await NameDAL.update(id, data);
  }

  static async remove(id: string) {
    return await NameDAL.remove(id);
  }
}
