import { FormDAL } from '../dal/form.dal';

export class FormService {
  static async getAll() {
    return await FormDAL.getAll();
  }

  static async getById(id: string) {
    return await FormDAL.getById(id);
  }

  static async create(data: any) {
    return await FormDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await FormDAL.update(id, data);
  }

  static async remove(id: string) {
    return await FormDAL.remove(id);
  }
}
