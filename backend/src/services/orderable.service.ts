import { OrderableDAL } from '../dal/orderable.dal';

export class OrderableService {
  static async getAll() {
    return await OrderableDAL.getAll();
  }

  static async getById(id: string) {
    return await OrderableDAL.getById(id);
  }

  static async create(data: any) {
    return await OrderableDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await OrderableDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrderableDAL.remove(id);
  }
}
