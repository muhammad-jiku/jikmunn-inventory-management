/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

var mockExpByCatFindMany: jest.Mock;
var mockExpByCatCount: jest.Mock;
var mockExpFindUnique: jest.Mock;
var mockExpCreate: jest.Mock;
var mockExpUpdate: jest.Mock;
var mockExpDelete: jest.Mock;

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    expenseByCategory: {
      findMany: (...args: any[]) => mockExpByCatFindMany(...args),
      count: (...args: any[]) => mockExpByCatCount(...args),
    },
    expenses: {
      findUnique: (...args: any[]) => mockExpFindUnique(...args),
      create: (...args: any[]) => mockExpCreate(...args),
      update: (...args: any[]) => mockExpUpdate(...args),
      delete: (...args: any[]) => mockExpDelete(...args),
    },
  },
}));

import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpensesByCategory,
  updateExpense,
} from '../expenseControllers';

describe('Expense Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockExpByCatFindMany = jest.fn();
    mockExpByCatCount = jest.fn();
    mockExpFindUnique = jest.fn();
    mockExpCreate = jest.fn();
    mockExpUpdate = jest.fn();
    mockExpDelete = jest.fn();
    mockReq = { query: {}, body: {}, params: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  /* ── getExpensesByCategory ── */
  describe('getExpensesByCategory', () => {
    it('should return paginated expenses with amount as string', async () => {
      const raw = [
        {
          expenseByCategoryId: 'e1',
          category: 'Food',
          amount: 150.5,
          date: new Date(),
        },
      ];
      mockExpByCatFindMany.mockResolvedValue(raw);
      mockExpByCatCount.mockResolvedValue(1);

      await getExpensesByCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [expect.objectContaining({ amount: '150.5' })],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        })
      );
    });

    it('should return 500 on error', async () => {
      mockExpByCatFindMany.mockRejectedValue(new Error('DB'));

      await getExpensesByCategory(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving expenses by category',
      });
    });
  });

  /* ── getExpenseById ── */
  describe('getExpenseById', () => {
    it('should return an expense by id', async () => {
      const expense = { expenseId: 'e1', category: 'Food', amount: 50 };
      mockReq.params = { id: 'e1' };
      mockExpFindUnique.mockResolvedValue(expense);

      await getExpenseById(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(expense);
    });

    it('should return 404 when expense not found', async () => {
      mockReq.params = { id: 'missing' };
      mockExpFindUnique.mockResolvedValue(null);

      await getExpenseById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Expense not found',
      });
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'e1' };
      mockExpFindUnique.mockRejectedValue(new Error('DB'));

      await getExpenseById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── createExpense ── */
  describe('createExpense', () => {
    it('should create an expense and return 201', async () => {
      const expense = { expenseId: 'e1', category: 'Travel', amount: 200 };
      mockReq.body = { category: 'Travel', amount: 200 };
      mockExpCreate.mockResolvedValue(expense);

      await createExpense(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expense);
    });

    it('should return 500 on error', async () => {
      mockReq.body = { category: 'Bad' };
      mockExpCreate.mockRejectedValue(new Error('DB'));

      await createExpense(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── updateExpense ── */
  describe('updateExpense', () => {
    it('should update an expense', async () => {
      const existing = { expenseId: 'e1', category: 'Old', amount: 10 };
      const updated = { ...existing, category: 'New' };
      mockReq.params = { id: 'e1' };
      mockReq.body = { category: 'New' };
      mockExpFindUnique.mockResolvedValue(existing);
      mockExpUpdate.mockResolvedValue(updated);

      await updateExpense(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when expense not found', async () => {
      mockReq.params = { id: 'missing' };
      mockReq.body = { category: 'X' };
      mockExpFindUnique.mockResolvedValue(null);

      await updateExpense(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'e1' };
      mockReq.body = { category: 'X' };
      mockExpFindUnique.mockRejectedValue(new Error('DB'));

      await updateExpense(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── deleteExpense ── */
  describe('deleteExpense', () => {
    it('should delete an expense and return 204', async () => {
      mockReq.params = { id: 'e1' };
      mockExpFindUnique.mockResolvedValue({ expenseId: 'e1' });
      mockExpDelete.mockResolvedValue({});

      await deleteExpense(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when expense not found', async () => {
      mockReq.params = { id: 'missing' };
      mockExpFindUnique.mockResolvedValue(null);

      await deleteExpense(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'e1' };
      mockExpFindUnique.mockRejectedValue(new Error('DB'));

      await deleteExpense(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
