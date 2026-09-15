import { ConceptproposalDAL } from '../dal/conceptproposal.dal';

export class ConceptproposalService {
  static async getAll() {
    return await ConceptproposalDAL.getAll();
  }

  static async getById(id: string) {
    return await ConceptproposalDAL.getById(id);
  }

  static async create(data: any) {
    return await ConceptproposalDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await ConceptproposalDAL.update(id, data);
  }

  static async remove(id: string) {
    return await ConceptproposalDAL.remove(id);
  }
}
