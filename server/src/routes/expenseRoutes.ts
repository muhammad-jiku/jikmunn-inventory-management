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

/**
 * @openapi
 * /expenses:
 *   get:
 *     tags: [Expenses]
 *     summary: List expenses by category with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of expenses by category
 *   post:
 *     tags: [Expenses]
 *     summary: Create a new expense
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, amount]
 *             properties:
 *               category: { type: string }
 *               amount: { type: number }
 *               timestamp: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Expense created
 */
router
  .route('/')
  .get(validateQuery(paginationSchema), getExpensesByCategory)
  .post(validateBody(createExpenseSchema), createExpense);

/**
 * @openapi
 * /expenses/{id}:
 *   get:
 *     tags: [Expenses]
 *     summary: Get expense by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Expense found
 *       404:
 *         description: Expense not found
 *   put:
 *     tags: [Expenses]
 *     summary: Update an expense
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Expense updated
 *       404:
 *         description: Expense not found
 *   delete:
 *     tags: [Expenses]
 *     summary: Delete an expense
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Expense deleted
 *       404:
 *         description: Expense not found
 */
router
  .route('/:id')
  .get(getExpenseById)
  .put(validateBody(updateExpenseSchema), updateExpense)
  .delete(deleteExpense);

export default router;
