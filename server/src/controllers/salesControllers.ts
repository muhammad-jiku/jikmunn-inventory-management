import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      prisma.sales.findMany({
        include: { product: true },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sales.count(),
    ]);

    sendPaginated(res, sales, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving sales');
  }
};

export const getSaleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const sale = await prisma.sales.findUnique({
      where: { saleId: id },
      include: { product: true },
    });

    if (!sale) {
      sendError(res, 404, 'Sale not found');
      return;
    }

    res.json(sale);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving sale');
  }
};

export const createSale = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, quantity, unitPrice, timestamp } = req.body;
    const totalAmount = quantity * unitPrice;

    const sale = await prisma.sales.create({
      data: {
        productId,
        quantity,
        unitPrice,
        totalAmount,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
      include: { product: true },
    });

    res.status(201).json(sale);
  } catch (_error) {
    sendError(res, 500, 'Error creating sale');
  }
};

export const updateSale = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId, quantity, unitPrice, timestamp } = req.body;

    const existing = await prisma.sales.findUnique({
      where: { saleId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Sale not found');
      return;
    }

    const qty = quantity ?? existing.quantity;
    const price = unitPrice ?? existing.unitPrice;
    const totalAmount = qty * price;

    const sale = await prisma.sales.update({
      where: { saleId: id },
      data: {
        ...(productId !== undefined && { productId }),
        ...(quantity !== undefined && { quantity }),
        ...(unitPrice !== undefined && { unitPrice }),
        totalAmount,
        ...(timestamp !== undefined && { timestamp: new Date(timestamp) }),
      },
      include: { product: true },
    });

    res.json(sale);
  } catch (_error) {
    sendError(res, 500, 'Error updating sale');
  }
};

export const deleteSale = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.sales.findUnique({
      where: { saleId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Sale not found');
      return;
    }

    await prisma.sales.delete({ where: { saleId: id } });
    res.status(204).send();
  } catch (_error) {
    sendError(res, 500, 'Error deleting sale');
  }
};
