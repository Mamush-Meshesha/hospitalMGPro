import { RelationshiptypeDAL } from '../dal/relationshiptype.dal';

export class RelationshiptypeService {
  static async getAll() {
    return await RelationshiptypeDAL.getAll();
  }

  static async getById(id: string) {
    return await RelationshiptypeDAL.getById(id);
  }

  static async create(data: any) {
    return await RelationshiptypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await RelationshiptypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await RelationshiptypeDAL.remove(id);
  }
}
