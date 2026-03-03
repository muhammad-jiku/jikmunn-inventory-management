import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import { logAudit } from '../lib/audit';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

/**
 * Import products from JSON array in request body.
 * Expected body: { data: [{ name, price, stockQuantity, ... }] }
 */
export const importProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      sendError(res, 400, 'Request body must contain a non-empty "data" array');
      return;
    }

    let successful = 0;
    let failed = 0;
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        if (
          !row.name ||
          typeof row.price !== 'number' ||
          typeof row.stockQuantity !== 'number'
        ) {
          throw new Error(
            'Missing required fields: name, price, stockQuantity'
          );
        }
        await prisma.products.create({
          data: {
            name: row.name,
            price: row.price,
            rating: row.rating ?? null,
            stockQuantity: row.stockQuantity,
            stockThreshold: row.stockThreshold ?? 10,
            barcode: row.barcode ?? null,
          },
        });
        successful++;
      } catch (err) {
        failed++;
        errors.push({ row: i + 1, error: (err as Error).message });
      }
    }

    const userId = (req as AuthRequest).user?.userId;

    // Log import in history
    await prisma.importHistory.create({
      data: {
        fileName: req.body.fileName ?? 'manual-import',
        entity: 'products',
        totalRows: data.length,
        successful,
        failed,
        errors: errors.length > 0 ? errors : undefined,
        userId,
      },
    });

    logAudit({
      userId,
      action: 'CREATE',
      entity: 'ImportHistory',
      entityId: 'bulk-import',
    });

    res.status(200).json({
      message: `Import complete: ${successful} succeeded, ${failed} failed out of ${data.length}`,
      successful,
      failed,
      totalRows: data.length,
      errors,
    });
  } catch (_error) {
    sendError(res, 500, 'Error importing products');
  }
};

/**
 * Bulk update stock quantities for multiple products.
 * Expected body: { updates: [{ productId, stockQuantity }] }
 */
export const bulkUpdateStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      sendError(
        res,
        400,
        'Request body must contain a non-empty "updates" array'
      );
      return;
    }

    let successful = 0;
    let failed = 0;
    const errors: { productId: string; error: string }[] = [];

    for (const update of updates) {
      try {
        await prisma.products.update({
          where: { productId: update.productId },
          data: { stockQuantity: update.stockQuantity },
        });
        successful++;
      } catch (err) {
        failed++;
        errors.push({
          productId: update.productId,
          error: (err as Error).message,
        });
      }
    }

    const userId = (req as AuthRequest).user?.userId;
    logAudit({
      userId,
      action: 'UPDATE',
      entity: 'Products',
      entityId: 'bulk-stock',
      changes: { count: updates.length, successful, failed },
    });

    res.json({
      message: `Stock update: ${successful} succeeded, ${failed} failed`,
      successful,
      failed,
      errors,
    });
  } catch (_error) {
    sendError(res, 500, 'Error updating stock');
  }
};

/**
 * Get import history with pagination.
 */
export const getImportHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      prisma.importHistory.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.importHistory.count(),
    ]);

    sendPaginated(res, history, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving import history');
  }
};
