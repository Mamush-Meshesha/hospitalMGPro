import { ConceptsearchDAL } from '../dal/conceptsearch.dal';

export class ConceptsearchService {
  static async getAll() {
    return await ConceptsearchDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptsearchDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptsearchDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptsearchDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptsearchDAL.remove(id);
  }
}
