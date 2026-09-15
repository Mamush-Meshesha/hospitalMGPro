import { Router } from 'express';
import * as controller from '../../controller/location.controller';

const router = Router();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.put('/:id/capacity', controller.setCapacity);
router.delete('/:id', controller.remove);

export default router;
