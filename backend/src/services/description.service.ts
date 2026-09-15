import { DescriptionDAL } from '../dal/description.dal';

export class DescriptionService {
  static async getAll() {
    return await DescriptionDAL.getAll();
  }

  static async getById(id: string) {
    return await DescriptionDAL.getById(id);
  }

  static async create(data: any) {
    return await DescriptionDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await DescriptionDAL.update(id, data);
  }

  static async remove(id: string) {
    return await DescriptionDAL.remove(id);
  }
}
