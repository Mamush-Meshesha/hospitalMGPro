import { VisitattributetypeDAL } from '../dal/visitattributetype.dal';

export class VisitattributetypeService {
  static async getAll() {
    return await VisitattributetypeDAL.getAll();
  }

  static async getById(id: string) {
    return await VisitattributetypeDAL.getById(id);
  }

  static async create(data: any) {
    return await VisitattributetypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await VisitattributetypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await VisitattributetypeDAL.remove(id);
  }
}
