import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

/**
 * List purchases with product details, paginated and sorted by date desc.
 * @param req - Express request (query: page?, limit?)
 * @param res - Express response with paginated purchases list
 */
export const getPurchases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.purchases.findMany({
        include: { product: true },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.purchases.count(),
    ]);

    sendPaginated(res, purchases, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving purchases');
  }
};

/**
 * Retrieve a single purchase by ID with product details.
 * @param req - Express request (params: id)
 * @param res - Express response with purchase or 404
 */
export const getPurchaseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const purchase = await prisma.purchases.findUnique({
      where: { purchaseId: id },
      include: { product: true },
    });

    if (!purchase) {
      sendError(res, 404, 'Purchase not found');
      return;
    }

    res.json(purchase);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving purchase');
  }
};

/**
 * Create a new purchase record.
 * totalCost is computed as quantity * unitCost.
 * @param req - Express request (body: productId, quantity, unitCost, timestamp?)
 * @param res - Express response with 201 and created purchase
 */
export const createPurchase = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, quantity, unitCost, timestamp } = req.body;
    const totalCost = quantity * unitCost;

    const purchase = await prisma.purchases.create({
      data: {
        productId,
        quantity,
        unitCost,
        totalCost,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
      include: { product: true },
    });

    res.status(201).json(purchase);
  } catch (_error) {
    sendError(res, 500, 'Error creating purchase');
  }
};

/**
 * Update an existing purchase by ID.
 * Recomputes totalCost when quantity or unitCost changes.
 * @param req - Express request (params: id, body: productId?, quantity?, unitCost?, timestamp?)
 * @param res - Express response with updated purchase or 404
 */
export const updatePurchase = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, quantity, unitCost, timestamp } = req.body;

    const existing = await prisma.purchases.findUnique({
      where: { purchaseId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Purchase not found');
      return;
    }

    const qty = quantity ?? existing.quantity;
    const cost = unitCost ?? existing.unitCost;
    const totalCost = qty * cost;

    const purchase = await prisma.purchases.update({
      where: { purchaseId: id },
      data: {
        ...(productId !== undefined && { productId }),
        ...(quantity !== undefined && { quantity }),
        ...(unitCost !== undefined && { unitCost }),
        totalCost,
        ...(timestamp !== undefined && { timestamp: new Date(timestamp) }),
      },
      include: { product: true },
    });

    res.json(purchase);
  } catch (_error) {
    sendError(res, 500, 'Error updating purchase');
  }
};

/**
 * Delete a purchase by ID.
 * @param req - Express request (params: id)
 * @param res - Express response with 204 on success or 404
 */
export const deletePurchase = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.purchases.findUnique({
      where: { purchaseId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Purchase not found');
      return;
    }

    await prisma.purchases.delete({ where: { purchaseId: id } });
    res.status(204).send();
  } catch (_error) {
    sendError(res, 500, 'Error deleting purchase');
  }
};
