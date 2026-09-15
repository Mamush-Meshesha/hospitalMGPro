import { OrderentryconfigDAL } from '../dal/orderentryconfig.dal';

export class OrderentryconfigService {
  static async getAll() {
    return await OrderentryconfigDAL.getAll();
  }

  static async getById(id: string) {
    return await OrderentryconfigDAL.getById(id);
  }

  static async create(data: any) {
    return await OrderentryconfigDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await OrderentryconfigDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrderentryconfigDAL.remove(id);
  }
}
