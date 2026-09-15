import { Router } from 'express';
import * as supplierController from '../controller/supplier.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateSupplierDto, UpdateSupplierDto } from '../dtos/supplier.dto';

const router = Router();

router.get('/', supplierController.listSuppliers);
router.get('/:id', supplierController.getSupplier);
router.post('/', validationMiddleware(CreateSupplierDto), supplierController.createSupplier);
router.put('/:id', validationMiddleware(UpdateSupplierDto), supplierController.updateSupplier);
router.delete('/:id', supplierController.deleteSupplier);

export default router;
