import { EncountertypeDAL } from '../dal/encountertype.dal';

export class EncountertypeService {
  static async getAll() {
    return await EncountertypeDAL.getAll();
  }

  static async getById(id: string) {
    return await EncountertypeDAL.getById(id);
  }

  static async create(data: any) {
    return await EncountertypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await EncountertypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await EncountertypeDAL.remove(id);
  }
}
