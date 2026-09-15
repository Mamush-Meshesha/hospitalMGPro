import { QueueDAL } from '../dal/queue.dal';

export class QueueService {
  static async getAllQueues() {
    return await QueueDAL.getAllQueues();
  }

  static async createQueue(data: { name: string, description?: string, locationId: number, serviceConceptId: number, creator: number }) {
    return await QueueDAL.createQueue(data);
  }

  static async getQueueEntries(queueId: number) {
    return await QueueDAL.getQueueEntries(queueId);
  }

  static async addPatientToQueue(data: { queueId: number, patientId: number, priority: number, creator: number }) {
    return await QueueDAL.addPatientToQueue(data);
  }

  static async updateEntryStatus(entryId: number, newStatus: number, creator: number) {
    return await QueueDAL.updateEntryStatus(entryId, newStatus, creator);
  }
}
