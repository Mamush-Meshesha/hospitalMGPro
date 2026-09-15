import { DrugreferencemapDAL } from '../dal/drugreferencemap.dal';

export class DrugreferencemapService {
  static async getAll() {
    return await DrugreferencemapDAL.getAll();
  }

  static async getById(id: string) {
    return await DrugreferencemapDAL.getById(id);
  }

  static async create(data: any) {
    return await DrugreferencemapDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await DrugreferencemapDAL.update(id, data);
  }

  static async remove(id: string) {
    return await DrugreferencemapDAL.remove(id);
  }
}
