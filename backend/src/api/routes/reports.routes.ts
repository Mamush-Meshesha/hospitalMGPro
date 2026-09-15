import { Router } from 'express';
import { Request, Response } from 'express';
import { ReportsDAL } from '../../dal/reports.dal';

const router = Router();

router.get('/daily-census', async (req: Request, res: Response) => {
  try {
    const data = await ReportsDAL.getDailyCensus();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch daily census' });
  }
});

router.get('/top-diagnoses', async (req: Request, res: Response) => {
  try {
    const data = await ReportsDAL.getTopDiagnoses();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch top diagnoses' });
  }
});

router.get('/bed-occupancy', async (req: Request, res: Response) => {
  try {
    const data = await ReportsDAL.getBedOccupancyByWard();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch bed occupancy' });
  }
});

router.get('/pharmacy-consumption', async (req: Request, res: Response) => {
  try {
    const data = await ReportsDAL.getPharmacyConsumption();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch pharmacy consumption' });
  }
});

export default router;
