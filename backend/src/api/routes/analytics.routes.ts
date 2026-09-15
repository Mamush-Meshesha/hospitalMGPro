import { Router } from 'express';
import { AnalyticsController } from '../../controller/analytics.controller';
import { requireAuth } from '../../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', requireAuth, AnalyticsController.getDashboardAnalytics);

export default router;
