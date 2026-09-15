import { Router } from 'express';
import * as controller from '../../controller/visit.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { requirePrivilege, requireLocation } from '../../middleware/rbac.middleware';

const router = Router();

// Only location-specific visits are loaded by default
router.get('/', requireAuth, requirePrivilege('VIEW_VISITS'), requireLocation, controller.getAll);
router.post('/', requireAuth, controller.create);
router.post('/admit', requireAuth, controller.admit);
router.get('/:id', requireAuth, requirePrivilege('VIEW_VISITS'), controller.getById);
router.post('/:id/transfer', requireAuth, controller.transfer);
router.put('/:id/assign', requireAuth, controller.updateAssignment);
router.post('/:id/discharge', requireAuth, controller.discharge);
import { prisma } from '../../utils/prisma';

router.get('/types', async (req, res) => {
  try {
    const types = await prisma.visit_type.findMany({ where: { retired: false } });
    res.json({ results: types });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAuth, controller.update);
router.delete('/:id', requireAuth, controller.remove);

export default router;
