import { Router } from 'express';
import * as controller from '../../controller/bed.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requirePrivilege } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/', requireAuth, controller.getAllBeds);
router.get('/:uuid', requireAuth, controller.getBedById);
router.post('/', requireAuth, requirePrivilege('MANAGE_BEDS'), controller.createBed);
router.post('/:uuid/admit', requireAuth, controller.assignPatientToBed);
router.post('/assignment/:assignmentUuid/discharge', requireAuth, controller.dischargePatientFromBed);
router.post('/assignment/:assignmentUuid/transfer', requireAuth, controller.transferPatient);

export default router;
