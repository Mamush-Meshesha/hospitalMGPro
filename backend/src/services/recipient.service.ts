import { RecipientDAL } from '../dal/recipient.dal';

export class RecipientService {
  static async getAll() {
    return await RecipientDAL.getAll();
  }

  static async getById(id: string) {
    return await RecipientDAL.getById(id);
  }

  static async create(data: any) {
    return await RecipientDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await RecipientDAL.update(id, data);
  }

  static async remove(id: string) {
    return await RecipientDAL.remove(id);
  }
}
