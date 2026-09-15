import { Request, Response } from 'express';
import { QueueService } from '../services/queue.service';

export class QueueController {
  static async getAllQueues(req: Request, res: Response) {
    try {
      const queues = await QueueService.getAllQueues();
      res.json({ results: queues });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createQueue(req: Request, res: Response) {
    try {
      const data = req.body;
      const queue = await QueueService.createQueue({
        name: data.name,
        description: data.description,
        locationId: data.locationId,
        serviceConceptId: data.serviceConceptId,
        creator: data.creator || 1
      });
      res.status(201).json({ result: queue });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getQueueEntries(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const entries = await QueueService.getQueueEntries(Number(id));
      res.json({ results: entries });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addPatientToQueue(req: Request, res: Response) {
    try {
      const { id } = req.params; // queueId
      const data = req.body;
      const entry = await QueueService.addPatientToQueue({
        queueId: Number(id),
        patientId: data.patientId,
        priority: data.priority || 10, // Default normal priority
        creator: data.creator || 1
      });
      res.status(201).json({ result: entry });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateEntryStatus(req: Request, res: Response) {
    try {
      const { entryId } = req.params;
      const { status, creator } = req.body;
      const entry = await QueueService.updateEntryStatus(
        Number(entryId), 
        status, 
        creator || 1
      );
      res.json({ result: entry });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
