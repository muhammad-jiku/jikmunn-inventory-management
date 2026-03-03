import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

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
