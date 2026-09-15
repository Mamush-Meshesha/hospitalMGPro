import { Router } from 'express';
import { ImmunizationController } from '../../controller/immunization.controller';

const router = Router();

router.get('/patient/:id', ImmunizationController.getImmunizations);
router.post('/patient/:id', ImmunizationController.recordImmunization);

export default router;
