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
    products: {
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
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../productControllers';

describe('Product Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

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

  /* ── getProducts ── */
  describe('getProducts', () => {
    it('should return products with pagination', async () => {
      const products = [{ productId: '1', name: 'Test', price: 29.99 }];
      mockFindMany.mockResolvedValue(products);
      mockCount.mockResolvedValue(1);

      await getProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: products,
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    });

    it('should filter products by search term', async () => {
      mockReq.query = { search: 'test' };
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(0);

      await getProducts(mockReq as Request, mockRes as Response);

      expect(mockFindMany).toHaveBeenCalledWith({
        where: { name: { contains: 'test' } },
        skip: 0,
        take: 20,
      });
    });

    it('should handle custom pagination params', async () => {
      mockReq.query = { page: '2', limit: '5' };
      mockFindMany.mockResolvedValue([]);
      mockCount.mockResolvedValue(10);

      await getProducts(mockReq as Request, mockRes as Response);

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 })
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: { page: 2, limit: 5, total: 10, totalPages: 2 },
        })
      );
    });

    it('should return 500 on error', async () => {
      mockFindMany.mockRejectedValue(new Error('DB Error'));
      mockCount.mockRejectedValue(new Error('DB Error'));

      await getProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving products',
      });
    });
  });

  /* ── getProductById ── */
  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const product = { productId: 'p1', name: 'Widget', price: 10 };
      mockReq.params = { id: 'p1' };
      mockFindUnique.mockResolvedValue(product);

      await getProductById(mockReq as Request, mockRes as Response);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { productId: 'p1' },
      });
      expect(mockRes.json).toHaveBeenCalledWith(product);
    });

    it('should return 404 when product not found', async () => {
      mockReq.params = { id: 'missing' };
      mockFindUnique.mockResolvedValue(null);

      await getProductById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'p1' };
      mockFindUnique.mockRejectedValue(new Error('DB Error'));

      await getProductById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── createProduct ── */
  describe('createProduct', () => {
    it('should create a product and return 201', async () => {
      const newProduct = { productId: 'uuid-123', name: 'New', price: 19.99 };
      mockReq.body = newProduct;
      mockCreate.mockResolvedValue(newProduct);

      await createProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(newProduct);
    });

    it('should pass stockThreshold when provided', async () => {
      mockReq.body = { name: 'A', price: 5, stockThreshold: 10 };
      mockCreate.mockResolvedValue({ productId: 'x', ...mockReq.body });

      await createProduct(mockReq as Request, mockRes as Response);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({ stockThreshold: 10 }),
      });
    });

    it('should return 500 on creation error', async () => {
      mockReq.body = { name: 'Bad' };
      mockCreate.mockRejectedValue(new Error('Create Error'));

      await createProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error creating product',
      });
    });
  });

  /* ── updateProduct ── */
  describe('updateProduct', () => {
    it('should update a product', async () => {
      const existing = { productId: 'p1', name: 'Old', price: 10 };
      const updated = { ...existing, name: 'New' };
      mockReq.params = { id: 'p1' };
      mockReq.body = { name: 'New' };
      mockFindUnique.mockResolvedValue(existing);
      mockUpdate.mockResolvedValue(updated);

      await updateProduct(mockReq as Request, mockRes as Response);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { productId: 'p1' },
        data: expect.objectContaining({ name: 'New' }),
      });
      expect(mockRes.json).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when product not found', async () => {
      mockReq.params = { id: 'missing' };
      mockReq.body = { name: 'X' };
      mockFindUnique.mockResolvedValue(null);

      await updateProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'p1' };
      mockReq.body = { name: 'X' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await updateProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── deleteProduct ── */
  describe('deleteProduct', () => {
    it('should delete a product and return 204', async () => {
      mockReq.params = { id: 'p1' };
      mockFindUnique.mockResolvedValue({ productId: 'p1' });
      mockDelete.mockResolvedValue({});

      await deleteProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should return 404 when product not found', async () => {
      mockReq.params = { id: 'missing' };
      mockFindUnique.mockResolvedValue(null);

      await deleteProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on error', async () => {
      mockReq.params = { id: 'p1' };
      mockFindUnique.mockRejectedValue(new Error('DB'));

      await deleteProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
