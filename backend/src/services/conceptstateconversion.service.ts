import { ConceptstateconversionDAL } from '../dal/conceptstateconversion.dal';

export class ConceptstateconversionService {
  static async getAll() {
    return await ConceptstateconversionDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptstateconversionDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptstateconversionDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptstateconversionDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptstateconversionDAL.remove(id);
  }
}
