import { OrderfrequencyDAL } from '../dal/orderfrequency.dal';

export class OrderfrequencyService {
  static async getAll() {
    return await OrderfrequencyDAL.getAll();
  }

  static async getById(id: string) {
    return await OrderfrequencyDAL.getById(id);
  }

  static async create(data: any) {
    return await OrderfrequencyDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await OrderfrequencyDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrderfrequencyDAL.remove(id);
  }
}
