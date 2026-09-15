import { Router } from 'express';
import * as warehouseController from '../controller/warehouse.controller';

const router = Router();

router.get('/', warehouseController.listWarehouses);
router.get('/:id', warehouseController.getWarehouse);
router.post('/', warehouseController.createWarehouse);
router.put('/:id', warehouseController.updateWarehouse);
router.delete('/:id', warehouseController.deleteWarehouse);

// Branches
router.get('/branches/all', warehouseController.listBranches);
router.post('/branches', warehouseController.createBranch);

export default router;
