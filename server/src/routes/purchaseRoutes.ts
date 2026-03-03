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

/**
 * @openapi
 * /purchases:
 *   get:
 *     tags: [Purchases]
 *     summary: List purchases with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of purchases
 *   post:
 *     tags: [Purchases]
 *     summary: Create a new purchase
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity, unitCost]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer }
 *               unitCost: { type: number }
 *               timestamp: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Purchase created
 */
router
  .route('/')
  .get(validateQuery(paginationSchema), getPurchases)
  .post(validateBody(createPurchaseSchema), createPurchase);

/**
 * @openapi
 * /purchases/{id}:
 *   get:
 *     tags: [Purchases]
 *     summary: Get purchase by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Purchase found
 *       404:
 *         description: Purchase not found
 *   put:
 *     tags: [Purchases]
 *     summary: Update a purchase
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Purchase updated
 *       404:
 *         description: Purchase not found
 *   delete:
 *     tags: [Purchases]
 *     summary: Delete a purchase
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Purchase deleted
 *       404:
 *         description: Purchase not found
 */
router
  .route('/:id')
  .get(getPurchaseById)
  .put(validateBody(updatePurchaseSchema), updatePurchase)
  .delete(deletePurchase);

export default router;
