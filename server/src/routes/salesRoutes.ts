import { Router } from 'express';
import {
  createSale,
  deleteSale,
  getSaleById,
  getSales,
  updateSale,
} from '../controllers/salesControllers';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createSaleSchema,
  paginationSchema,
  updateSaleSchema,
} from '../schemas';

const router = Router();

router
  .route('/')
  .get(validateQuery(paginationSchema), getSales)
  .post(validateBody(createSaleSchema), createSale);

router
  .route('/:id')
  .get(getSaleById)
  .put(validateBody(updateSaleSchema), updateSale)
  .delete(deleteSale);

export default router;
