import { ReferencerangeDAL } from '../dal/referencerange.dal';

export class ReferencerangeService {
  static async getAll() {
    return await ReferencerangeDAL.getAll();
  }

  static async getById(id: string) {
    return await ReferencerangeDAL.getById(id);
  }

  static async create(data: any) {
    return await ReferencerangeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ReferencerangeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ReferencerangeDAL.remove(id);
  }
}
