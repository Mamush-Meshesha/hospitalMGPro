import { Router } from 'express';
import { InventoryController } from '../../controller/inventory.controller';

const router = Router();

router.get('/', InventoryController.getAllStockItems);
router.post('/item', InventoryController.createStockItem);
router.post('/receive', InventoryController.receiveStock);
router.post('/dispatch', InventoryController.dispatchStock);

export default router;
