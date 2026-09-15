import { MedicationdispenseDAL } from '../dal/medicationdispense.dal';

export class MedicationdispenseService {
  static async getAll() {
    return await MedicationdispenseDAL.getAll();
  }

  static async getById(id: string) {
    return await MedicationdispenseDAL.getById(id);
  }

  static async create(data: any) {
    return await MedicationdispenseDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await MedicationdispenseDAL.update(id, data);
  }

  static async remove(id: string) {
    return await MedicationdispenseDAL.remove(id);
  }
}
