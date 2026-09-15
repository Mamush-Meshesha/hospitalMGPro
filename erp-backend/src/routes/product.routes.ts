import { Router } from 'express';
import * as productController from '../controller/product.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateProductDto } from '../dtos/product.dto';

const router = Router();

router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);
router.post('/', validationMiddleware(CreateProductDto), productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
