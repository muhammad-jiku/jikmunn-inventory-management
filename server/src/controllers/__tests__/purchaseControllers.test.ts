/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

var mockFindMany: jest.Mock;
var mockFindUnique: jest.Mock;
var mockCount: jest.Mock;
var mockCreate: jest.Mock;
var mockUpdate: jest.Mock;
var mockDelete: jest.Mock;

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    purchases: {
      findMany: (...args: any[]) => mockFindMany(...args),
      findUnique: (...args: any[]) => mockFindUnique(...args),
      count: (...args: any[]) => mockCount(...args),
      create: (...args: any[]) => mockCreate(...args),
      update: (...args: any[]) => mockUpdate(...args),
      delete: (...args: any[]) => mockDelete(...args),
    },
  },
}));

import {
  createPurchase,
  deletePurchase,
  getPurchaseById,
  getPurchases,
  updatePurchase,
} from '../purchaseControllers';

describe('Purchase Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  const samplePurchase = {
    purchaseId: 'pu1',
    productId: 'p1',
    quantity: 10,
    unitCost: 5,
    totalCost: 50,
    timestamp: new Date(),
    product: { productId: 'p1', name: 'Widget' },
  };

  beforeEach(() => {
    mockFindMany = jest.fn();
    mockFindUnique = jest.fn();
    mockCount = jest.fn();
    mockCreate = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockReq = { query: {}, body: {}, params: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  /* ── getPurchases ── */
  describe('getPurchases', () => {
    it('should return paginated purchases', async () => {
      mockFindMany.mockResolvedValue([samplePurchase]);
      mockCount.mockResolvedValue(1);

      await getPurchases(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: [samplePurchase],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    });

    it('should return 500 on error', async () => {
      mockFindMany.mockRejectedValue(new Error('DB'));

      await getPurchases(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving purchases',
      });
    });
  });

  /* ── getPurchaseById ── */
  describe('getPurchaseById', () => {
    it('should return a purchase by id', async () => {
      mockReq.params = { id: 'pu1' };
      mockFindUnique.mockResolvedValue(samplePurchase);

      await getPurchaseById(mockReq as Request, mockRes as Response);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { purchaseId: 'pu1' },
        include: { product: true },
      });
      expect(mockRes.json).toHaveBeenCalledWith(samplePurchase);
    });

    it('should return 404 when purchase not found', async () => {
      mockReq.params = { id: 'missing' };
      mockFindUnique.mockResolvedValue(null);

      await getPurchaseById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Purchase not found',
      });
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'pu1' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await getPurchaseById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── createPurchase ── */
  describe('createPurchase', () => {
    it('should create a purchase with computed totalCost and return 201', async () => {
      mockReq.body = { productId: 'p1', quantity: 4, unitCost: 8 };
      const created = {
        ...samplePurchase,
        quantity: 4,
        unitCost: 8,
        totalCost: 32,
      };
      mockCreate.mockResolvedValue(created);

      await createPurchase(mockReq as Request, mockRes as Response);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalCost: 32 }),
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return 500 on error', async () => {
      mockReq.body = { productId: 'p1', quantity: 1, unitCost: 5 };
      mockCreate.mockRejectedValue(new Error('DB'));

      await createPurchase(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── updatePurchase ── */
  describe('updatePurchase', () => {
    it('should update a purchase and recompute totalCost', async () => {
      mockReq.params = { id: 'pu1' };
      mockReq.body = { quantity: 20 };
      mockFindUnique.mockResolvedValue(samplePurchase);
      const updated = { ...samplePurchase, quantity: 20, totalCost: 100 };
      mockUpdate.mockResolvedValue(updated);

      await updatePurchase(mockReq as Request, mockRes as Response);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalCost: 100 }),
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when purchase not found', async () => {
      mockReq.params = { id: 'missing' };
      mockReq.body = { quantity: 1 };
      mockFindUnique.mockResolvedValue(null);

      await updatePurchase(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'pu1' };
      mockReq.body = { quantity: 1 };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await updatePurchase(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── deletePurchase ── */
  describe('deletePurchase', () => {
    it('should delete a purchase and return 204', async () => {
      mockReq.params = { id: 'pu1' };
      mockFindUnique.mockResolvedValue(samplePurchase);
      mockDelete.mockResolvedValue({});

      await deletePurchase(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when purchase not found', async () => {
      mockReq.params = { id: 'missing' };
      mockFindUnique.mockResolvedValue(null);

      await deletePurchase(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'pu1' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await deletePurchase(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
