import { ProviderroleDAL } from '../dal/providerrole.dal';

export class ProviderroleService {
  static async getAll() {
    return await ProviderroleDAL.getAll();
  }

  static async getById(id: string) {
    return await ProviderroleDAL.getById(id);
  }

  static async create(data: any) {
    return await ProviderroleDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ProviderroleDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ProviderroleDAL.remove(id);
  }
}
