import { CustomdatatypeDAL } from '../dal/customdatatype.dal';

export class CustomdatatypeService {
  static async getAll() {
    return await CustomdatatypeDAL.getAll();
  }

  static async getById(id: string) {
    return await CustomdatatypeDAL.getById(id);
  }

  static async create(data: any) {
    return await CustomdatatypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await CustomdatatypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await CustomdatatypeDAL.remove(id);
  }
}
