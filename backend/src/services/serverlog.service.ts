import { ServerlogDAL } from '../dal/serverlog.dal';

export class ServerlogService {
  static async getAll() {
    return await ServerlogDAL.getAll();
  }

  static async getById(id: string) {
    return await ServerlogDAL.getById(id);
  }

  static async create(data: any) {
    return await ServerlogDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ServerlogDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ServerlogDAL.remove(id);
  }
}
