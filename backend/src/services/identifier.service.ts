import { IdentifierDAL } from '../dal/identifier.dal';

export class IdentifierService {
  static async getAll() {
    return await IdentifierDAL.getAll();
  }

  static async getById(id: string) {
    return await IdentifierDAL.getById(id);
  }

  static async create(data: any) {
    return await IdentifierDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await IdentifierDAL.update(id, data);
  }

  static async remove(id: string) {
    return await IdentifierDAL.remove(id);
  }
}
