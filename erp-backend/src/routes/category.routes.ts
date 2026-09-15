import { Router } from 'express';
import * as categoryController from '../controller/category.controller';

const router = Router();

router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// UOM routes
router.post('/uom', categoryController.createUom);
router.put('/uom/:id', categoryController.updateUom);
router.delete('/uom/:id', categoryController.deleteUom);

export default router;
