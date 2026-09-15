import { Router } from 'express';
import * as poController from '../controller/po.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreatePurchaseOrderDto } from '../dtos/po.dto';

const router = Router();

router.get('/', poController.listPOs);
router.get('/:id', poController.getPO);
router.post('/', validationMiddleware(CreatePurchaseOrderDto), poController.createPO);
router.patch('/:id/status', poController.updateStatus);
router.put('/:id', poController.updatePO);
router.delete('/:id', poController.deletePO);


export default router;
