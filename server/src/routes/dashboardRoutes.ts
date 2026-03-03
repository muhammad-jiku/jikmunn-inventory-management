import { Router } from 'express';
import {
  getDashboardMetrics,
  getKpiMetrics,
  getLowStockProducts,
  getReports,
  getSalesAggregation,
  sendLowStockEmail,
} from '../controllers/dashboardControllers';

const router = Router();

/**
 * @openapi
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard metrics (popular products, summaries)
 *     responses:
 *       200:
 *         description: Dashboard metrics
 */
router.route('/').get(getDashboardMetrics);

/**
 * @openapi
 * /dashboard/kpi:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get KPI metrics (revenue, products, users, expenses)
 *     responses:
 *       200:
 *         description: KPI metrics
 */
router.route('/kpi').get(getKpiMetrics);

/**
 * @openapi
 * /dashboard/sales-aggregation:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get sales aggregation by timeframe
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema: { type: string, enum: [daily, weekly, monthly], default: weekly }
 *     responses:
 *       200:
 *         description: Aggregated sales data
 */
router.route('/sales-aggregation').get(getSalesAggregation);

/**
 * @openapi
 * /dashboard/reports:
 *   get:
 *     tags: [Dashboard]
 *     summary: Generate reports (P&L, stock valuation, top sellers)
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Report data
 */
router.route('/reports').get(getReports);

/**
 * @openapi
 * /dashboard/low-stock:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get products below stock threshold
 *     responses:
 *       200:
 *         description: Low stock products list
 */
router.route('/low-stock').get(getLowStockProducts);

/**
 * @openapi
 * /dashboard/low-stock/notify:
 *   post:
 *     tags: [Dashboard]
 *     summary: Send low stock email alert
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Email sent or no low stock products
 *       400:
 *         description: No recipient email configured
 */
router.route('/low-stock/notify').post(sendLowStockEmail);

export default router;
