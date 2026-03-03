import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogControllers';
import { authenticate, authorize } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';
import { paginationSchema } from '../schemas';

const router = Router();

/**
 * @openapi
 * /audit-logs:
 *   get:
 *     tags: [Audit Logs]
 *     summary: List audit logs with pagination and filters
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
 *         name: entity
 *         schema: { type: string }
 *         description: Filter by entity type (e.g. Product, Order)
 *       - in: query
 *         name: action
 *         schema: { type: string, enum: [CREATE, UPDATE, DELETE] }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of audit log entries
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 */
router.get(
  '/',
  authenticate,
  authorize('admin'),
  validateQuery(paginationSchema),
  getAuditLogs
);

export default router;
