import { OrdergroupDAL } from '../dal/ordergroup.dal';

export class OrdergroupService {
  static async getAll() {
    return await OrdergroupDAL.getAll();
  }

  static async getById(id: string) {
    return await OrdergroupDAL.getById(id);
  }

  static async create(data: any) {
    return await OrdergroupDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await OrdergroupDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrdergroupDAL.remove(id);
  }
}
