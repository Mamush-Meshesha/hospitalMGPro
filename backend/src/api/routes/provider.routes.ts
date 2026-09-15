import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from '../../controller/provider.controller';

const router = Router();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', requireAuth, controller.getById);
router.post('/:id/ward', requireAuth, controller.assignWard);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', controller.remove);

export default router;
