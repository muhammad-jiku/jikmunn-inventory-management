import { Request, Response } from 'express';
import { sendError, sendPaginated } from '../lib/apiResponse';
import prisma from '../lib/prisma';

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
