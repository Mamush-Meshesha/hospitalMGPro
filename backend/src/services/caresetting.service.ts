import { CaresettingDAL } from '../dal/caresetting.dal';

export class CaresettingService {
  static async getAll() {
    return await CaresettingDAL.getAll();
  }

  static async getById(id: string) {
    return await CaresettingDAL.getById(id);
  }

  static async create(data: any) {
    return await CaresettingDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await CaresettingDAL.update(id, data);
  }

  static async remove(id: string) {
    return await CaresettingDAL.remove(id);
  }
}
