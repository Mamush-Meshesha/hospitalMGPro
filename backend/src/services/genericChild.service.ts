import { GenericchildDAL } from '../dal/genericChild.dal';

export class GenericchildService {
  static async getAll() {
    return await GenericchildDAL.getAll();
  }

  static async getById(id: string) {
    return await GenericchildDAL.getById(id);
  }

  static async create(data: any) {
    return await GenericchildDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await GenericchildDAL.update(id, data);
  }

  static async remove(id: string) {
    return await GenericchildDAL.remove(id);
  }
}
