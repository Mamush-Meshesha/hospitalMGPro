import { OrdersetmemberDAL } from '../dal/ordersetmember.dal';

export class OrdersetmemberService {
  static async getAll() {
    return await OrdersetmemberDAL.getAll();
  }

  static async getById(id: string) {
    return await OrdersetmemberDAL.getById(id);
  }

  static async create(data: any) {
    return await OrdersetmemberDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await OrdersetmemberDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrdersetmemberDAL.remove(id);
  }
}
