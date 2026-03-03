import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

/**
 * List expenses grouped by category with pagination.
 * Converts Decimal amount to string for JSON serialization.
 * @param req - Express request (query: page?, limit?)
 * @param res - Express response with paginated expense-by-category list
 */
export const getExpensesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [rawData, total] = await Promise.all([
      prisma.expenseByCategory.findMany({
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expenseByCategory.count(),
    ]);

    const data = rawData.map((item) => ({
      ...item,
      amount: item.amount.toString(),
    }));

    sendPaginated(res, data, page, limit, total);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving expenses by category');
  }
};

/**
 * Retrieve a single expense record by ID.
 * @param req - Express request (params: id)
 * @param res - Express response with expense or 404
 */
export const getExpenseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await prisma.expenses.findUnique({
      where: { expenseId: id },
    });

    if (!expense) {
      sendError(res, 404, 'Expense not found');
      return;
    }

    res.json(expense);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving expense');
  }
};

/**
 * Create a new expense record.
 * @param req - Express request (body: category, amount, timestamp?)
 * @param res - Express response with 201 and created expense
 */
export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, amount, timestamp } = req.body;
    const expense = await prisma.expenses.create({
      data: {
        category,
        amount,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });
    res.status(201).json(expense);
  } catch (_error) {
    sendError(res, 500, 'Error creating expense');
  }
};

/**
 * Update an existing expense by ID.
 * @param req - Express request (params: id, body: category?, amount?, timestamp?)
 * @param res - Express response with updated expense or 404
 */
export const updateExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { category, amount, timestamp } = req.body;

    const existing = await prisma.expenses.findUnique({
      where: { expenseId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Expense not found');
      return;
    }

    const expense = await prisma.expenses.update({
      where: { expenseId: id },
      data: {
        ...(category !== undefined && { category }),
        ...(amount !== undefined && { amount }),
        ...(timestamp !== undefined && { timestamp: new Date(timestamp) }),
      },
    });

    res.json(expense);
  } catch (_error) {
    sendError(res, 500, 'Error updating expense');
  }
};

/**
 * Delete an expense by ID.
 * @param req - Express request (params: id)
 * @param res - Express response with 204 on success or 404
 */
export const deleteExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.expenses.findUnique({
      where: { expenseId: id },
    });

    if (!existing) {
      sendError(res, 404, 'Expense not found');
      return;
    }

    await prisma.expenses.delete({ where: { expenseId: id } });
    res.status(204).send();
  } catch (_error) {
    sendError(res, 500, 'Error deleting expense');
  }
};
