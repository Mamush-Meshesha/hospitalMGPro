import { ModuleDAL } from '../dal/module.dal';

export class ModuleService {
  static async getAll() {
    return await ModuleDAL.getAll();
  }

  static async getById(id: string) {
    return await ModuleDAL.getById(id);
  }

  static async create(data: any) {
    return await ModuleDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ModuleDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ModuleDAL.remove(id);
  }
}
