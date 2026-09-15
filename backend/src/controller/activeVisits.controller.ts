import { Request, Response } from 'express';
import { ActiveVisitsDAL } from '../dal/activeVisits.dal';

export class ActiveVisitsController {
  static async getAll(req: Request, res: Response) {
    try {
      const visits = await ActiveVisitsDAL.getActiveVisits(req.locationId);
      return res.json({ results: visits, count: visits.length });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch active visits' });
    }
  }

  static async getCount(req: Request, res: Response) {
    try {
      const count = await ActiveVisitsDAL.getActiveVisitCount(req.locationId);
      return res.json({ count });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch count' });
    }
  }
}
