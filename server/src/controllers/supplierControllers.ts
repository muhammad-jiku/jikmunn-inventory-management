import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import { logAudit } from '../lib/audit';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * List suppliers with pagination.
 */
export const getSuppliers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search?.toString();

    const where = search ? { name: { contains: search } } : {};

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.supplier.count({ where }),
    ]);

    sendPaginated(res, suppliers, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving suppliers');
  }
};

/**
 * Get a single supplier by ID.
 */
export const getSupplierById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { supplierId: req.params.id },
      include: {
        Purchases: {
          take: 10,
          orderBy: { timestamp: 'desc' },
          include: { product: true },
        },
      },
    });

    if (!supplier) {
      sendError(res, 404, 'Supplier not found');
      return;
    }

    res.json(supplier);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving supplier');
  }
};

/**
 * Create a new supplier.
 */
export const createSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, contact, email, address, notes } = req.body;
    const supplier = await prisma.supplier.create({
      data: { name, contact, email, address, notes },
    });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({
      userId,
      action: 'CREATE',
      entity: 'Supplier',
      entityId: supplier.supplierId,
    });

    res.status(201).json(supplier);
  } catch (_error) {
    sendError(res, 500, 'Error creating supplier');
  }
};

/**
 * Update a supplier by ID.
 */
export const updateSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.supplier.findUnique({
      where: { supplierId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Supplier not found');
      return;
    }

    const supplier = await prisma.supplier.update({
      where: { supplierId: id },
      data: req.body,
    });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({
      userId,
      action: 'UPDATE',
      entity: 'Supplier',
      entityId: id,
      changes: { before: existing, after: supplier },
    });

    res.json(supplier);
  } catch (_error) {
    sendError(res, 500, 'Error updating supplier');
  }
};

/**
 * Delete a supplier by ID.
 */
export const deleteSupplier = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await prisma.supplier.findUnique({
      where: { supplierId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Supplier not found');
      return;
    }

    await prisma.supplier.delete({ where: { supplierId: id } });

    const userId = (req as AuthRequest).user?.userId;
    logAudit({ userId, action: 'DELETE', entity: 'Supplier', entityId: id });

    res.status(204).send();
  } catch (_error) {
    sendError(res, 500, 'Error deleting supplier');
  }
};
