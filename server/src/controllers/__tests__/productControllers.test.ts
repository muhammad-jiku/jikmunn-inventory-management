/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

// Declare with `var` for hoisting; assign in beforeEach
var mockFindMany: jest.Mock;
var mockCount: jest.Mock;
var mockCreate: jest.Mock;

// Factory uses arrow wrappers so the actual mock is resolved lazily at call time
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    products: {
      findMany: (...args: any[]) => mockFindMany(...args),
      count: (...args: any[]) => mockCount(...args),
      create: (...args: any[]) => mockCreate(...args),
    },
  },
}));

import { createProduct, getProducts } from '../productControllers';

describe('Product Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockFindMany = jest.fn();
    mockCount = jest.fn();
    mockCreate = jest.fn();
    mockReq = {
      query: {},
      body: {},
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return products with pagination', async () => {
      const mockProductList = [
        {
          productId: '1',
          name: 'Test Product',
          price: 29.99,
          rating: 4.5,
          stockQuantity: 100,
        },
      ];
      mockFindMany.mockResolvedValue(mockProductList);
      mockCount.mockResolvedValue(1);

      await getProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockProductList,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
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

  describe('createProduct', () => {
    it('should create a product and return 201', async () => {
      const newProduct = {
        productId: 'uuid-123',
        name: 'New Product',
        price: 19.99,
        rating: 4.0,
        stockQuantity: 50,
      };
      mockReq.body = newProduct;
      mockCreate.mockResolvedValue(newProduct);

      await createProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(newProduct);
    });

    it('should return 500 on creation error', async () => {
      mockReq.body = { name: 'Bad Product' };
      mockCreate.mockRejectedValue(new Error('Create Error'));

      await createProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error creating product',
      });
    });
  });
});
