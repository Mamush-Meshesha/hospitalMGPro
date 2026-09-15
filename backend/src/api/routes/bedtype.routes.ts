import { Router } from 'express';
import * as controller from '../../controller/bedType.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', controller.getAll);
router.post('/', requireAuth, controller.create);
router.get('/:id', controller.getById);
router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
