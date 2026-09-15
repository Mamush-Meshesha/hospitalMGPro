import { Router } from 'express';
import * as controller from '../../controller/auth.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.post('/login', controller.login);
router.get('/me', requireAuth, controller.me);

export default router;
