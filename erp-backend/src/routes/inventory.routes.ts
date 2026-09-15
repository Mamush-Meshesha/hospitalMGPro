import { Router } from 'express';
import * as inventoryController from '../controller/inventory.controller';

const router = Router();

router.get('/batches', inventoryController.listBatches);
router.get('/batches/:id', inventoryController.getBatch);
router.post('/batches', inventoryController.createBatch);
router.put('/batches/:id', inventoryController.updateBatch);
router.delete('/batches/:id', inventoryController.deleteBatch);

export default router;
