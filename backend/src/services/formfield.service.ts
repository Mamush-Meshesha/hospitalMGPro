import { FormfieldDAL } from '../dal/formfield.dal';

export class FormfieldService {
  static async getAll() {
    return await FormfieldDAL.getAll();
  }

  static async getById(id: string) {
    return await FormfieldDAL.getById(id);
  }

  static async create(data: any) {
    return await FormfieldDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await FormfieldDAL.update(id, data);
  }

  static async remove(id: string) {
    return await FormfieldDAL.remove(id);
  }
}
