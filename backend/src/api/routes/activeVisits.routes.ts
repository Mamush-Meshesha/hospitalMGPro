import { Router } from 'express';
import { ActiveVisitsController } from '../../controller/activeVisits.controller';

const router = Router();

router.get('/', ActiveVisitsController.getAll);
router.get('/count', ActiveVisitsController.getCount);

export default router;
