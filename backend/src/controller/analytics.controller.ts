import { Request, Response } from 'express';
import { AnalyticsDAL } from '../dal/analytics.dal';

export class AnalyticsController {
  static async getDashboardAnalytics(req: Request, res: Response) {
    try {
      const type = req.query.type as string;
      const locationId = req.locationId;

      let data;
      switch (type) {
        case 'admin':
          data = await AnalyticsDAL.getAdminAnalytics(locationId);
          break;
        case 'lab':
          data = await AnalyticsDAL.getLabAnalytics(locationId);
          break;
        case 'pharmacy':
          data = await AnalyticsDAL.getPharmacyAnalytics(locationId);
          break;
        case 'storekeeper':
          data = await AnalyticsDAL.getStorekeeperAnalytics(locationId);
          break;
        case 'procurement':
          data = await AnalyticsDAL.getProcurementAnalytics(locationId);
          break;
        case 'clinical':
          data = await AnalyticsDAL.getClinicalAnalytics(locationId);
          break;
        case 'frontdesk':
          data = await AnalyticsDAL.getFrontDeskAnalytics(locationId);
          break;
        default:
          return res.status(400).json({ error: 'Invalid dashboard type' });
      }

      return res.json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}
