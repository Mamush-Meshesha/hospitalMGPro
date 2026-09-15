import { Router } from 'express';
import { Request, Response } from 'express';
import { MedicationsDAL } from '../../dal/medications.dal';

const router = Router();

router.get('/patient/:id', async (req: Request, res: Response) => {
  try {
    const data = await MedicationsDAL.getPatientMedications(parseInt(req.params.id));
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch medications' });
  }
});

export default router;
