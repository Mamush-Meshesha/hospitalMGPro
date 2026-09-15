import { HandlersDAL } from '../dal/handlers.dal';

export class HandlersService {
  static async getAll() {
    return await HandlersDAL.getAll();
  }

  static async getById(id: string) {
    return await HandlersDAL.getById(id);
  }

  static async create(data: any) {
    return await HandlersDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await HandlersDAL.update(id, data);
  }

  static async remove(id: string) {
    return await HandlersDAL.remove(id);
  }
}
