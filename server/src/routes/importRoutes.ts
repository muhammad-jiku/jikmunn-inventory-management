import { Router } from 'express';
import {
  bulkUpdateStock,
  getImportHistory,
  importProducts,
} from '../controllers/importControllers';
import { authenticate, authorize } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { paginationSchema } from '../schemas';

const router = Router();

/**
 * @openapi
 * /imports/products:
 *   post:
 *     tags: [Import / Export]
 *     summary: Bulk import products from JSON array
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [products]
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [name, price, stockQuantity]
 *                   properties:
 *                     name: { type: string }
 *                     price: { type: number }
 *                     rating: { type: number }
 *                     stockQuantity: { type: integer }
 *     responses:
 *       200:
 *         description: Import result with success/failure counts
 */
router.post(
  '/products',
  authenticate,
  authorize('admin', 'manager'),
  importProducts
);

/**
 * @openapi
 * /imports/products/bulk-stock:
 *   patch:
 *     tags: [Import / Export]
 *     summary: Bulk update product stock quantities
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [updates]
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, stockQuantity]
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     stockQuantity: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: Bulk stock update result
 */
router.patch(
  '/products/bulk-stock',
  authenticate,
  authorize('admin', 'manager'),
  bulkUpdateStock
);

/**
 * @openapi
 * /imports/history:
 *   get:
 *     tags: [Import / Export]
 *     summary: List import history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of import operations
 */
router.get(
  '/history',
  authenticate,
  authorize('admin', 'manager'),
  validateQuery(paginationSchema),
  getImportHistory
);

export default router;
