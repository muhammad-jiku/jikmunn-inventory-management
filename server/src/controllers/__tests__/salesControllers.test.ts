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
    sales: {
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
  createSale,
  deleteSale,
  getSaleById,
  getSales,
  updateSale,
} from '../salesControllers';

describe('Sales Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  const sampleSale = {
    saleId: 's1',
    productId: 'p1',
    quantity: 5,
    unitPrice: 10,
    totalAmount: 50,
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

  /* ── getSales ── */
  describe('getSales', () => {
    it('should return paginated sales', async () => {
      mockFindMany.mockResolvedValue([sampleSale]);
      mockCount.mockResolvedValue(1);

      await getSales(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: [sampleSale],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    });

    it('should return 500 on error', async () => {
      mockFindMany.mockRejectedValue(new Error('DB'));

      await getSales(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving sales',
      });
    });
  });

  /* ── getSaleById ── */
  describe('getSaleById', () => {
    it('should return a sale by id', async () => {
      mockReq.params = { id: 's1' };
      mockFindUnique.mockResolvedValue(sampleSale);

      await getSaleById(mockReq as Request, mockRes as Response);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { saleId: 's1' },
        include: { product: true },
      });
      expect(mockRes.json).toHaveBeenCalledWith(sampleSale);
    });

    it('should return 404 when sale not found', async () => {
      mockReq.params = { id: 'missing' };
      mockFindUnique.mockResolvedValue(null);

      await getSaleById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Sale not found' });
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 's1' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await getSaleById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── createSale ── */
  describe('createSale', () => {
    it('should create a sale with computed totalAmount and return 201', async () => {
      mockReq.body = { productId: 'p1', quantity: 3, unitPrice: 20 };
      const created = {
        ...sampleSale,
        quantity: 3,
        unitPrice: 20,
        totalAmount: 60,
      };
      mockCreate.mockResolvedValue(created);

      await createSale(mockReq as Request, mockRes as Response);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalAmount: 60 }),
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return 500 on error', async () => {
      mockReq.body = { productId: 'p1', quantity: 1, unitPrice: 10 };
      mockCreate.mockRejectedValue(new Error('DB'));

      await createSale(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── updateSale ── */
  describe('updateSale', () => {
    it('should update a sale and recompute totalAmount', async () => {
      mockReq.params = { id: 's1' };
      mockReq.body = { quantity: 10 };
      mockFindUnique.mockResolvedValue(sampleSale);
      const updated = { ...sampleSale, quantity: 10, totalAmount: 100 };
      mockUpdate.mockResolvedValue(updated);

      await updateSale(mockReq as Request, mockRes as Response);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalAmount: 100 }),
        })
      );
      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when sale not found', async () => {
      mockReq.params = { id: 'missing' };
      mockReq.body = { quantity: 1 };
      mockFindUnique.mockResolvedValue(null);

      await updateSale(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 's1' };
      mockReq.body = { quantity: 1 };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await updateSale(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── deleteSale ── */
  describe('deleteSale', () => {
    it('should delete a sale and return 204', async () => {
      mockReq.params = { id: 's1' };
      mockFindUnique.mockResolvedValue(sampleSale);
      mockDelete.mockResolvedValue({});

      await deleteSale(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when sale not found', async () => {
      mockReq.params = { id: 'missing' };
      mockFindUnique.mockResolvedValue(null);

      await deleteSale(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 's1' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await deleteSale(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
