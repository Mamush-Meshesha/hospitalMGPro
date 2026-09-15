import { Hl7sourceDAL } from '../dal/hl7source.dal';

export class Hl7sourceService {
  static async getAll() {
    return await Hl7sourceDAL.getAll();
  }

  static async getById(id: string) {
    return await Hl7sourceDAL.getById(id);
  }

  static async create(data: any) {
    return await Hl7sourceDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await Hl7sourceDAL.update(id, data);
  }

  static async remove(id: string) {
    return await Hl7sourceDAL.remove(id);
  }
}
