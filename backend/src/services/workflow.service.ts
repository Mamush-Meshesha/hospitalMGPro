import { WorkflowDAL } from '../dal/workflow.dal';

export class WorkflowService {
  static async getAll() {
    return await WorkflowDAL.getAll();
  }

  static async getById(id: string) {
    return await WorkflowDAL.getById(id);
  }

  static async create(data: any) {
    return await WorkflowDAL.create(data);
  }

  static async update(id: string, data: any) {
    return await WorkflowDAL.update(id, data);
  }

  static async remove(id: string) {
    return await WorkflowDAL.remove(id);
  }
}
