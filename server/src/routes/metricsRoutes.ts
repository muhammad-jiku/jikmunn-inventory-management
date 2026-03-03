import { Router } from 'express';
import { getApiMetrics } from '../controllers/metricsControllers';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /metrics:
 *   get:
 *     tags: [API Metrics]
 *     summary: Get aggregated API metrics (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema: { type: integer, default: 24 }
 *         description: Look-back window in hours
 *     responses:
 *       200:
 *         description: Aggregated API metrics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin only
 */
router.get('/', authenticate, authorize('admin'), getApiMetrics);

export default router;
