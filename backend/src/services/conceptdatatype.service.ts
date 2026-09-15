import { ConceptdatatypeDAL } from '../dal/conceptdatatype.dal';

export class ConceptdatatypeService {
  static async getAll() {
    return await ConceptdatatypeDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptdatatypeDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptdatatypeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptdatatypeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptdatatypeDAL.remove(id);
  }
}
