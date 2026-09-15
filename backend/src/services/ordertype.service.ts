import { OrdertypeDAL } from '../dal/ordertype.dal';

export class OrdertypeService {
  static async getAll() {
    return await OrdertypeDAL.getAll();
  }

  static async getById(id: string) {
    return await OrdertypeDAL.getById(id);
  }

  static async create(data: any) {
    return await OrdertypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await OrdertypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrdertypeDAL.remove(id);
  }
}
