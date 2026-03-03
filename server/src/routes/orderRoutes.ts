import { Router } from 'express';
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from '../controllers/orderControllers';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createOrderSchema,
  paginationSchema,
  updateOrderStatusSchema,
} from '../schemas';

const router = Router();

/**
 * @openapi
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: List orders with pagination and status filter
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
 *         name: status
 *         schema: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 *     responses:
 *       200:
 *         description: Paginated list of orders
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               notes: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productId, quantity, unitPrice]
 *                   properties:
 *                     productId: { type: string, format: uuid }
 *                     quantity: { type: integer, minimum: 1 }
 *                     unitPrice: { type: number, minimum: 0 }
 *     responses:
 *       201:
 *         description: Order created
 */
router
  .route('/')
  .get(authenticate, validateQuery(paginationSchema), getOrders)
  .post(
    authenticate,
    authorize('admin', 'manager'),
    validateBody(createOrderSchema),
    createOrder
  );

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID with items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order found
 *       404:
 *         description: Order not found
 *   delete:
 *     tags: [Orders]
 *     summary: Delete an order (only pending/cancelled)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Order deleted
 *       400:
 *         description: Cannot delete non-pending/cancelled order
 */
router
  .route('/:id')
  .get(authenticate, getOrderById)
  .delete(authenticate, authorize('admin'), deleteOrder);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (state machine transitions)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [confirmed, shipped, delivered, cancelled] }
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status transition
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin', 'manager'),
  validateBody(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
