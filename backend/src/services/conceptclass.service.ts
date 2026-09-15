import { ConceptclassDAL } from '../dal/conceptclass.dal';

export class ConceptclassService {
  static async getAll() {
    return await ConceptclassDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptclassDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptclassDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptclassDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptclassDAL.remove(id);
  }
}
