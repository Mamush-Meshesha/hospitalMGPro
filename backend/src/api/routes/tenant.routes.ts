import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import * as controller from '../../controller/tenant.controller';

const router = Router();

// Tenant management endpoints (Super Admin only in practice)
router.post('/', requireAuth, controller.createTenant);
router.get('/', requireAuth, controller.getTenants);

// Subscriptions management endpoints
// Normally these would be protected by a SUPER_ADMIN privilege, but for now we rely on auth
router.get('/:id/subscriptions', requireAuth, controller.getSubscriptions);
router.post('/:id/subscriptions', requireAuth, controller.addSubscription);
router.delete('/:id/subscriptions/:moduleId', requireAuth, controller.removeSubscription);

export default router;
