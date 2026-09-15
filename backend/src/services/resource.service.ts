import { ResourceDAL } from '../dal/resource.dal';

export class ResourceService {
  static async getAll() {
    return await ResourceDAL.getAll();
  }

  static async getById(id: string) {
    return await ResourceDAL.getById(id);
  }

  static async create(data: any) {
    return await ResourceDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ResourceDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ResourceDAL.remove(id);
  }
}
