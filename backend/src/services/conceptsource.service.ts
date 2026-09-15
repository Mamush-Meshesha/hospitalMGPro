import { ConceptsourceDAL } from '../dal/conceptsource.dal';

export class ConceptsourceService {
  static async getAll() {
    return await ConceptsourceDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptsourceDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptsourceDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptsourceDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptsourceDAL.remove(id);
  }
}
