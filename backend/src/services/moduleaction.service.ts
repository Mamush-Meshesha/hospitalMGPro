import { ModuleactionDAL } from '../dal/moduleaction.dal';

export class ModuleactionService {
  static async getAll() {
    return await ModuleactionDAL.getAll();
  }

  static async getById(id: string) {
    return await ModuleactionDAL.getById(id);
  }

  static async create(data: any) {
    return await ModuleactionDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ModuleactionDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ModuleactionDAL.remove(id);
  }
}
