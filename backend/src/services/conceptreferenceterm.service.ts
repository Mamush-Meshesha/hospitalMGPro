import { ConceptreferencetermDAL } from '../dal/conceptreferenceterm.dal';

export class ConceptreferencetermService {
  static async getAll() {
    return await ConceptreferencetermDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptreferencetermDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptreferencetermDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptreferencetermDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptreferencetermDAL.remove(id);
  }
}
