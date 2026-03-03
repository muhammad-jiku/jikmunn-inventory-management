import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpensesByCategory,
  updateExpense,
} from '../controllers/expenseControllers';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createExpenseSchema,
  paginationSchema,
  updateExpenseSchema,
} from '../schemas';

const router = Router();

router
  .route('/')
  .get(validateQuery(paginationSchema), getExpensesByCategory)
  .post(validateBody(createExpenseSchema), createExpense);

router
  .route('/:id')
  .get(getExpenseById)
  .put(validateBody(updateExpenseSchema), updateExpense)
  .delete(deleteExpense);

export default router;
