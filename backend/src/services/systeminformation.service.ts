import { SysteminformationDAL } from '../dal/systeminformation.dal';

export class SysteminformationService {
  static async getAll() {
    return await SysteminformationDAL.getAll();
  }

  static async getById(id: string) {
    return await SysteminformationDAL.getById(id);
  }

  static async create(data: any) {
    return await SysteminformationDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await SysteminformationDAL.update(id, data);
  }

  static async remove(id: string) {
    return await SysteminformationDAL.remove(id);
  }
}
