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

/**
 * @openapi
 * /sales:
 *   get:
 *     tags: [Sales]
 *     summary: List sales with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of sales
 *   post:
 *     tags: [Sales]
 *     summary: Create a new sale
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity, unitPrice]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer }
 *               unitPrice: { type: number }
 *               timestamp: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Sale created
 */
router
  .route('/')
  .get(validateQuery(paginationSchema), getSales)
  .post(validateBody(createSaleSchema), createSale);

/**
 * @openapi
 * /sales/{id}:
 *   get:
 *     tags: [Sales]
 *     summary: Get sale by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sale found
 *       404:
 *         description: Sale not found
 *   put:
 *     tags: [Sales]
 *     summary: Update a sale
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sale updated
 *       404:
 *         description: Sale not found
 *   delete:
 *     tags: [Sales]
 *     summary: Delete a sale
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Sale deleted
 *       404:
 *         description: Sale not found
 */
router
  .route('/:id')
  .get(getSaleById)
  .put(validateBody(updateSaleSchema), updateSale)
  .delete(deleteSale);

export default router;
