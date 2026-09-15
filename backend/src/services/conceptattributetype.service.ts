import { ConceptattributetypeDAL } from '../dal/conceptattributetype.dal';

export class ConceptattributetypeService {
  static async getAll() {
    return await ConceptattributetypeDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptattributetypeDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptattributetypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptattributetypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptattributetypeDAL.remove(id);
  }
}
