import { Router } from 'express';
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouseById,
  getWarehouses,
  transferStock,
  updateWarehouse,
  updateWarehouseStock,
} from '../controllers/warehouseControllers';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createWarehouseSchema,
  paginationSchema,
  transferStockSchema,
  updateWarehouseSchema,
  updateWarehouseStockSchema,
} from '../schemas';

const router = Router();

/**
 * @openapi
 * /warehouses:
 *   get:
 *     tags: [Warehouses]
 *     summary: List warehouses with stock information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of warehouses
 *   post:
 *     tags: [Warehouses]
 *     summary: Create a new warehouse
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               location: { type: string }
 *               capacity: { type: integer }
 *     responses:
 *       201:
 *         description: Warehouse created
 */
router
  .route('/')
  .get(authenticate, validateQuery(paginationSchema), getWarehouses)
  .post(
    authenticate,
    authorize('admin'),
    validateBody(createWarehouseSchema),
    createWarehouse
  );

/**
 * @openapi
 * /warehouses/{id}:
 *   get:
 *     tags: [Warehouses]
 *     summary: Get warehouse by ID with stock details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Warehouse found
 *       404:
 *         description: Warehouse not found
 *   put:
 *     tags: [Warehouses]
 *     summary: Update warehouse details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Warehouse updated
 *   delete:
 *     tags: [Warehouses]
 *     summary: Delete a warehouse
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Warehouse deleted
 */
router
  .route('/:id')
  .get(authenticate, getWarehouseById)
  .put(
    authenticate,
    authorize('admin'),
    validateBody(updateWarehouseSchema),
    updateWarehouse
  )
  .delete(authenticate, authorize('admin'), deleteWarehouse);

/**
 * @openapi
 * /warehouses/{warehouseId}/stock/{productId}:
 *   put:
 *     tags: [Warehouses]
 *     summary: Update stock for a product in a warehouse
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: Stock updated
 */
router.put(
  '/:warehouseId/stock/:productId',
  authenticate,
  authorize('admin', 'manager'),
  validateBody(updateWarehouseStockSchema),
  updateWarehouseStock
);

/**
 * @openapi
 * /warehouses/transfer:
 *   post:
 *     tags: [Warehouses]
 *     summary: Transfer stock between warehouses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromWarehouseId, toWarehouseId, productId, quantity]
 *             properties:
 *               fromWarehouseId: { type: string, format: uuid }
 *               toWarehouseId: { type: string, format: uuid }
 *               productId: { type: string, format: uuid }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Stock transferred successfully
 *       400:
 *         description: Insufficient stock or invalid transfer
 */
router.post(
  '/transfer',
  authenticate,
  authorize('admin', 'manager'),
  validateBody(transferStockSchema),
  transferStock
);

export default router;
