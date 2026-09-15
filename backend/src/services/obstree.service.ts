import { ObstreeDAL } from '../dal/obstree.dal';

export class ObstreeService {
  static async getAll() {
    return await ObstreeDAL.getAll();
  }

  static async getById(id: string) {
    return await ObstreeDAL.getById(id);
  }

  static async create(data: any) {
    return await ObstreeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ObstreeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ObstreeDAL.remove(id);
  }
}
