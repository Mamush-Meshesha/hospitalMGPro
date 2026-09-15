import { Router } from 'express';
import * as controller from '../../controller/patient.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requirePrivilege } from '../../middleware/rbac.middleware';

const router = Router();

router.get('/', requireAuth, requirePrivilege('VIEW_PATIENTS'), controller.getAll);
router.get('/global-search', requireAuth, requirePrivilege('VIEW_PATIENTS'), controller.globalSearch);
router.post('/', requireAuth, requirePrivilege('ADD_PATIENT'), controller.create);
router.post('/merge', requireAuth, requirePrivilege('EDIT_PATIENT'), controller.merge);
router.get('/:id', requireAuth, requirePrivilege('VIEW_PATIENTS'), controller.getById);
router.put('/:id', requireAuth, requirePrivilege('EDIT_PATIENT'), controller.update);
router.delete('/:id', requireAuth, requirePrivilege('DELETE_PATIENT'), controller.remove);

export default router;
