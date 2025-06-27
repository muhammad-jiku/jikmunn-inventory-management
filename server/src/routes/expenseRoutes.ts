import { Router } from 'express';
import { getExpensesByCategory } from '../controllers/expenseControllers';

const router = Router();

router.route('/').get(getExpensesByCategory);

export default router;
