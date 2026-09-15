import { AlertDAL } from '../dal/alert.dal';

export class AlertService {
  static async getAll() {
    return await AlertDAL.getAll();
  }

  static async getById(id: string) {
    return await AlertDAL.getById(id);
  }

  static async create(data: any) {
    return await AlertDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await AlertDAL.update(id, data);
  }

  static async remove(id: string) {
    return await AlertDAL.remove(id);
  }
}
