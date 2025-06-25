import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboardControllers';

const router = Router();

router.route('/').get(getDashboardMetrics);

export default router;
