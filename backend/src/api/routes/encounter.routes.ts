import { Router } from 'express';
import * as controller from '../../controller/encounter.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requireLocation } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/', requireAuth, requireLocation, controller.getAll);
router.post('/', requireAuth, controller.create);
router.get('/patient/:patientUuid', requireAuth, controller.getByPatient);
router.get('/:id', requireAuth, controller.getById);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
