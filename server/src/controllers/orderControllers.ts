import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import { logAudit } from '../lib/audit';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

/**
 * List orders with pagination and optional status filter.
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (
      req.query.status &&
      VALID_STATUSES.includes(req.query.status as string)
    ) {
      where.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { items: { include: { product: true } } },
      }),
      prisma.order.count({ where }),
    ]);

    sendPaginated(res, orders, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving orders');
  }
};

/**
 * Get a single order by ID with all items.
 */
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId: req.params.id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      sendError(res, 404, 'Order not found');
      return;
    }

    res.json(order);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving order');
  }
};

/**
 * Create a new order with items.
 * @param req.body - { notes?, items: [{ productId, quantity, unitPrice }] }
 */
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      sendError(res, 400, 'Order must have at least one item');
      return;
    }

    const order = await prisma.order.create({
      data: {
        notes,
        items: {
          create: items.map(
            (item: {
              productId: string;
              quantity: number;
              unitPrice: number;
            }) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })
          ),
        },
      },
      include: { items: { include: { product: true } } },
    });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({
      userId,
      action: 'CREATE',
      entity: 'Order',
      entityId: order.orderId,
    });

    res.status(201).json(order);
  } catch (_error) {
    sendError(res, 500, 'Error creating order');
  }
};

/**
 * Transition an order's status (with validation of allowed transitions).
 * Auto-updates stock on delivery.
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      sendError(
        res,
        400,
        `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      );
      return;
    }

    const order = await prisma.order.findUnique({
      where: { orderId: id },
      include: { items: true },
    });

    if (!order) {
      sendError(res, 404, 'Order not found');
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      sendError(
        res,
        400,
        `Cannot transition from "${order.status}" to "${status}". Allowed: ${allowed.join(', ') || 'none'}`
      );
      return;
    }

    // Auto-deduct stock on delivery
    if (status === 'delivered') {
      for (const item of order.items) {
        await prisma.products.update({
          where: { productId: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }
    }

    const updated = await prisma.order.update({
      where: { orderId: id },
      data: { status },
      include: { items: { include: { product: true } } },
    });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({
      userId,
      action: 'UPDATE',
      entity: 'Order',
      entityId: id,
      changes: { oldStatus: order.status, newStatus: status },
    });

    res.json(updated);
  } catch (_error) {
    sendError(res, 500, 'Error updating order status');
  }
};

/**
 * Delete an order (only pending/cancelled).
 */
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({ where: { orderId: id } });

    if (!order) {
      sendError(res, 404, 'Order not found');
      return;
    }

    if (!['pending', 'cancelled'].includes(order.status)) {
      sendError(res, 400, 'Only pending or cancelled orders can be deleted');
      return;
    }

    await prisma.order.delete({ where: { orderId: id } });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({ userId, action: 'DELETE', entity: 'Order', entityId: id });

    res.status(204).send();
  } catch (_error) {
    sendError(res, 500, 'Error deleting order');
  }
};
