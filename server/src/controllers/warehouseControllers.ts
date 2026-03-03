import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import { logAudit } from '../lib/audit';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * List warehouses with pagination.
 */
export const getWarehouses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          stocks: {
            include: { product: { select: { name: true, price: true } } },
          },
        },
      }),
      prisma.warehouse.count(),
    ]);

    sendPaginated(res, warehouses, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving warehouses');
  }
};

/**
 * Get a single warehouse by ID with stock details.
 */
export const getWarehouseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const warehouse = await prisma.warehouse.findUnique({
      where: { warehouseId: req.params.id },
      include: {
        stocks: {
          include: { product: true },
          orderBy: { quantity: 'desc' },
        },
      },
    });

    if (!warehouse) {
      sendError(res, 404, 'Warehouse not found');
      return;
    }

    res.json(warehouse);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving warehouse');
  }
};

/**
 * Create a new warehouse.
 */
export const createWarehouse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, location, capacity } = req.body;
    const warehouse = await prisma.warehouse.create({
      data: { name, location, capacity },
    });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({
      userId,
      action: 'CREATE',
      entity: 'Warehouse',
      entityId: warehouse.warehouseId,
    });

    res.status(201).json(warehouse);
  } catch (_error) {
    sendError(res, 500, 'Error creating warehouse');
  }
};

/**
 * Update a warehouse by ID.
 */
export const updateWarehouse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.warehouse.findUnique({
      where: { warehouseId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Warehouse not found');
      return;
    }

    const warehouse = await prisma.warehouse.update({
      where: { warehouseId: id },
      data: req.body,
    });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({ userId, action: 'UPDATE', entity: 'Warehouse', entityId: id });

    res.json(warehouse);
  } catch (_error) {
    sendError(res, 500, 'Error updating warehouse');
  }
};

/**
 * Delete a warehouse by ID.
 */
export const deleteWarehouse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.warehouse.findUnique({
      where: { warehouseId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Warehouse not found');
      return;
    }

    await prisma.warehouse.delete({ where: { warehouseId: id } });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({ userId, action: 'DELETE', entity: 'Warehouse', entityId: id });

    res.status(204).send();
  } catch (_error) {
    sendError(res, 500, 'Error deleting warehouse');
  }
};

/**
 * Update stock for a product in a warehouse. Creates the record if it doesn't exist.
 */
export const updateWarehouseStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { warehouseId, productId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 0) {
      sendError(res, 400, 'Quantity must be a non-negative number');
      return;
    }

    const stock = await prisma.warehouseStock.upsert({
      where: { warehouseId_productId: { warehouseId, productId } },
      update: { quantity },
      create: { warehouseId, productId, quantity },
      include: { product: true, warehouse: true },
    });

    res.json(stock);
  } catch (_error) {
    sendError(res, 500, 'Error updating warehouse stock');
  }
};

/**
 * Transfer stock between warehouses.
 */
export const transferStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fromWarehouseId, toWarehouseId, productId, quantity } = req.body;

    if (!fromWarehouseId || !toWarehouseId || !productId || !quantity) {
      sendError(
        res,
        400,
        'fromWarehouseId, toWarehouseId, productId, and quantity are required'
      );
      return;
    }

    if (quantity <= 0) {
      sendError(res, 400, 'Quantity must be positive');
      return;
    }

    // Check source stock
    const sourceStock = await prisma.warehouseStock.findUnique({
      where: {
        warehouseId_productId: { warehouseId: fromWarehouseId, productId },
      },
    });

    if (!sourceStock || sourceStock.quantity < quantity) {
      sendError(res, 400, 'Insufficient stock in source warehouse');
      return;
    }

    // Transaction: decrement source, upsert destination
    const [updatedSource, updatedDest] = await prisma.$transaction([
      prisma.warehouseStock.update({
        where: {
          warehouseId_productId: { warehouseId: fromWarehouseId, productId },
        },
        data: { quantity: { decrement: quantity } },
      }),
      prisma.warehouseStock.upsert({
        where: {
          warehouseId_productId: { warehouseId: toWarehouseId, productId },
        },
        update: { quantity: { increment: quantity } },
        create: { warehouseId: toWarehouseId, productId, quantity },
      }),
    ]);

    const userId = (req as AuthRequest).user?.userId;
    logAudit({
      userId,
      action: 'UPDATE',
      entity: 'WarehouseStock',
      entityId: productId,
      changes: {
        fromWarehouseId,
        toWarehouseId,
        quantity,
        sourceRemaining: updatedSource.quantity,
        destTotal: updatedDest.quantity,
      },
    });

    res.json({ source: updatedSource, destination: updatedDest });
  } catch (_error) {
    sendError(res, 500, 'Error transferring stock');
  }
};
