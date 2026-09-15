import { ConceptreferencetermmapDAL } from '../dal/conceptreferencetermmap.dal';

export class ConceptreferencetermmapService {
  static async getAll() {
    return await ConceptreferencetermmapDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptreferencetermmapDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptreferencetermmapDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptreferencetermmapDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptreferencetermmapDAL.remove(id);
  }
}
