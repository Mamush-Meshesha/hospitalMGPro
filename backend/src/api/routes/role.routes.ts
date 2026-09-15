import { Router } from 'express';
import * as controller from '../../controller/role.controller';

const router = Router();

router.get('/', controller.getAll);
router.get('/privileges', controller.getAllPrivileges); // MUST be before /:id
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.post('/:id/privileges', controller.updatePrivileges);
router.delete('/:id', controller.remove);

export default router;
