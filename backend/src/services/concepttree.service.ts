import { ConcepttreeDAL } from '../dal/concepttree.dal';

export class ConcepttreeService {
  static async getAll() {
    return await ConcepttreeDAL.getAll();
  }

  static async getById(id: string) {
    return await ConcepttreeDAL.getById(id);
  }

  static async create(data: any) {
    return await ConcepttreeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConcepttreeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConcepttreeDAL.remove(id);
  }
}
