import { OrderattributetypeDAL } from '../dal/orderattributetype.dal';

export class OrderattributetypeService {
  static async getAll() {
    return await OrderattributetypeDAL.getAll();
  }

  static async getById(id: string) {
    return await OrderattributetypeDAL.getById(id);
  }

  static async create(data: any) {
    return await OrderattributetypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await OrderattributetypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await OrderattributetypeDAL.remove(id);
  }
}
