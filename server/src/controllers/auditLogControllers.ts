import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

/**
 * List audit log entries with pagination and optional filters.
 * @param req - Express request (query: page?, limit?, entity?, action?, userId?)
 * @param res - Express response with paginated audit log
 */
export const getAuditLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (req.query.entity) where.entity = req.query.entity;
    if (req.query.action) where.action = req.query.action;
    if (req.query.userId) where.userId = req.query.userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    sendPaginated(res, logs, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving audit logs');
  }
};
