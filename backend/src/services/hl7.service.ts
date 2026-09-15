import { Hl7DAL } from '../dal/hl7.dal';

export class Hl7Service {
  static async getAll() {
    return await Hl7DAL.getAll();
  }

  static async getById(id: string) {
    return await Hl7DAL.getById(id);
  }

  static async create(data: any) {
    return await Hl7DAL.create(data);
  }

  static async update(id: string, data: any) {
    return await Hl7DAL.update(id, data);
  }

  static async remove(id: string) {
    return await Hl7DAL.remove(id);
  }
}
