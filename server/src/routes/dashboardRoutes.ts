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

router.route('/').get(getDashboardMetrics);
router.route('/kpi').get(getKpiMetrics);
router.route('/sales-aggregation').get(getSalesAggregation);
router.route('/reports').get(getReports);
router.route('/low-stock').get(getLowStockProducts);
router.route('/low-stock/notify').post(sendLowStockEmail);

export default router;
