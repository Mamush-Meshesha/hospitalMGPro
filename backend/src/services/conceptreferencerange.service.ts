import { ConceptreferencerangeDAL } from '../dal/conceptreferencerange.dal';

export class ConceptreferencerangeService {
  static async getAll() {
    return await ConceptreferencerangeDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptreferencerangeDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptreferencerangeDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptreferencerangeDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptreferencerangeDAL.remove(id);
  }
}
