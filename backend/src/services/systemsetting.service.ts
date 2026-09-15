import { SystemsettingDAL } from '../dal/systemsetting.dal';

export class SystemsettingService {
  static async getAll() {
    return await SystemsettingDAL.getAll();
  }

  static async getById(id: string) {
    return await SystemsettingDAL.getById(id);
  }

  static async create(data: any) {
    return await SystemsettingDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await SystemsettingDAL.update(id, data);
  }

  static async remove(id: string) {
    return await SystemsettingDAL.remove(id);
  }
}
