import { ConceptDAL } from '../dal/concept.dal';

export class ConceptService {
  static async getAll() {
    return await ConceptDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptDAL.remove(id);
  }
}
