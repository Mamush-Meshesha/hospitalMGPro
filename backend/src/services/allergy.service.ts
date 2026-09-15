import { AllergyDAL } from '../dal/allergy.dal';

export class AllergyService {
  static async getAll() {
    return await AllergyDAL.getAll();
  }

  static async getById(id: string) {
    return await AllergyDAL.getById(id);
  }

  static async create(data: any) {
    return await AllergyDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await AllergyDAL.update(id, data);
  }

  static async remove(id: string) {
    return await AllergyDAL.remove(id);
  }
}
