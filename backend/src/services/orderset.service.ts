import { OrdersetDAL } from '../dal/orderset.dal';

export class OrdersetService {
  static async getAll() {
    return await OrdersetDAL.getAll();
  }

  static async getById(id: string) {
    return await OrdersetDAL.getById(id);
  }

  static async create(data: any) {
    return await OrdersetDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await OrdersetDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrdersetDAL.remove(id);
  }
}
