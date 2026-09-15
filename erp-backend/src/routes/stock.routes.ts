import { Router } from 'express';
import * as stockService from '../services/stock.service';

const router = Router();

router.get('/availability', async (req, res) => {
  try {
    const { conceptId } = req.query;
    if (!conceptId) return res.status(400).json({ error: 'Missing conceptId' });
    const result = await stockService.checkAvailability(Number(conceptId));
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/dispatch', async (req, res) => {
  try {
    const { conceptId, quantity, locationId } = req.body;
    const result = await stockService.dispatchStock(Number(conceptId), Number(quantity), Number(locationId));
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
