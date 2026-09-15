import { DatabasechangeDAL } from '../dal/databasechange.dal';

export class DatabasechangeService {
  static async getAll() {
    return await DatabasechangeDAL.getAll();
  }

  static async getById(id: string) {
    return await DatabasechangeDAL.getById(id);
  }

  static async create(data: any) {
    return await DatabasechangeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await DatabasechangeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await DatabasechangeDAL.remove(id);
  }
}
