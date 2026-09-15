import { ConceptstopwordDAL } from '../dal/conceptstopword.dal';

export class ConceptstopwordService {
  static async getAll() {
    return await ConceptstopwordDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptstopwordDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptstopwordDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptstopwordDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptstopwordDAL.remove(id);
  }
}
