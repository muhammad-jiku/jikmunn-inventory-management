import { Router } from 'express';
import {
  createPurchase,
  deletePurchase,
  getPurchaseById,
  getPurchases,
  updatePurchase,
} from '../controllers/purchaseControllers';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createPurchaseSchema,
  paginationSchema,
  updatePurchaseSchema,
} from '../schemas';

const router = Router();

router
  .route('/')
  .get(validateQuery(paginationSchema), getPurchases)
  .post(validateBody(createPurchaseSchema), createPurchase);

router
  .route('/:id')
  .get(getPurchaseById)
  .put(validateBody(updatePurchaseSchema), updatePurchase)
  .delete(deletePurchase);

export default router;
