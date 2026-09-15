import { EncounterroleDAL } from '../dal/encounterrole.dal';

export class EncounterroleService {
  static async getAll() {
    return await EncounterroleDAL.getAll();
  }

  static async getById(id: string) {
    return await EncounterroleDAL.getById(id);
  }

  static async create(data: any) {
    return await EncounterroleDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await EncounterroleDAL.update(id, data);
  }

  static async remove(id: string) {
    return await EncounterroleDAL.remove(id);
  }
}
