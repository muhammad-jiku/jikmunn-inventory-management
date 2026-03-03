import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../controllers/productControllers';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createProductSchema,
  paginationSchema,
  updateProductSchema,
} from '../schemas';

const router = Router();

router
  .route('/')
  .get(validateQuery(paginationSchema), getProducts)
  .post(validateBody(createProductSchema), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(validateBody(updateProductSchema), updateProduct)
  .delete(deleteProduct);

export default router;
