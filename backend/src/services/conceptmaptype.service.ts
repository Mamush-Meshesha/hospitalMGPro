import { ConceptmaptypeDAL } from '../dal/conceptmaptype.dal';

export class ConceptmaptypeService {
  static async getAll() {
    return await ConceptmaptypeDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptmaptypeDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptmaptypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptmaptypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptmaptypeDAL.remove(id);
  }
}
