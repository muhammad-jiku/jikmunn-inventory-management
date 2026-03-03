/* eslint-disable no-var, @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

var mockProductsFindMany: jest.Mock;
var mockProductsCount: jest.Mock;
var mockSalesSummaryFindMany: jest.Mock;
var mockPurchaseSummaryFindMany: jest.Mock;
var mockExpenseSummaryFindMany: jest.Mock;
var mockExpByCatFindMany: jest.Mock;
var mockUsersCount: jest.Mock;
var mockSalesAggregate: jest.Mock;
var mockSalesFindMany: jest.Mock;
var mockSalesGroupBy: jest.Mock;
var mockSalesCount: jest.Mock;
var mockExpensesAggregate: jest.Mock;
var mockPurchasesAggregate: jest.Mock;
var mockQueryRaw: jest.Mock;
var mockSendLowStockAlert: jest.Mock;

jest.mock('../../lib/env', () => ({
  __esModule: true,
  default: {
    ALERT_EMAIL: 'admin@test.com',
  },
}));

jest.mock('../../lib/mailer', () => ({
  sendLowStockAlert: (...args: any[]) => mockSendLowStockAlert(...args),
}));

jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {
    products: {
      findMany: (...args: any[]) => mockProductsFindMany(...args),
      count: (...args: any[]) => mockProductsCount(...args),
    },
    salesSummary: {
      findMany: (...args: any[]) => mockSalesSummaryFindMany(...args),
    },
    purchaseSummary: {
      findMany: (...args: any[]) => mockPurchaseSummaryFindMany(...args),
    },
    expenseSummary: {
      findMany: (...args: any[]) => mockExpenseSummaryFindMany(...args),
    },
    expenseByCategory: {
      findMany: (...args: any[]) => mockExpByCatFindMany(...args),
    },
    users: {
      count: (...args: any[]) => mockUsersCount(...args),
    },
    sales: {
      aggregate: (...args: any[]) => mockSalesAggregate(...args),
      findMany: (...args: any[]) => mockSalesFindMany(...args),
      groupBy: (...args: any[]) => mockSalesGroupBy(...args),
      count: (...args: any[]) => mockSalesCount(...args),
    },
    expenses: {
      aggregate: (...args: any[]) => mockExpensesAggregate(...args),
    },
    purchases: {
      aggregate: (...args: any[]) => mockPurchasesAggregate(...args),
    },
    $queryRaw: (...args: any[]) => mockQueryRaw(...args),
  },
}));

import {
  getDashboardMetrics,
  getKpiMetrics,
  getLowStockProducts,
  getSalesAggregation,
  sendLowStockEmail,
} from '../dashboardControllers';

describe('Dashboard Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockProductsFindMany = jest.fn();
    mockProductsCount = jest.fn();
    mockSalesSummaryFindMany = jest.fn();
    mockPurchaseSummaryFindMany = jest.fn();
    mockExpenseSummaryFindMany = jest.fn();
    mockExpByCatFindMany = jest.fn();
    mockUsersCount = jest.fn();
    mockSalesAggregate = jest.fn();
    mockSalesFindMany = jest.fn();
    mockSalesGroupBy = jest.fn();
    mockSalesCount = jest.fn();
    mockExpensesAggregate = jest.fn();
    mockPurchasesAggregate = jest.fn();
    mockQueryRaw = jest.fn();
    mockSendLowStockAlert = jest.fn();
    mockReq = { query: {}, body: {}, params: {} };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  /* ── getDashboardMetrics ── */
  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const products = [{ productId: 'p1', name: 'W', stockQuantity: 100 }];
      const salesSummary = [{ salesSummaryId: 's1' }];
      const purchaseSummary = [{ purchaseSummaryId: 'ps1' }];
      const expenseSummary = [{ expenseSummaryId: 'es1' }];
      const expByCat = [{ expenseByCategoryId: 'ec1', amount: 500 }];

      mockProductsFindMany.mockResolvedValue(products);
      mockSalesSummaryFindMany.mockResolvedValue(salesSummary);
      mockPurchaseSummaryFindMany.mockResolvedValue(purchaseSummary);
      mockExpenseSummaryFindMany.mockResolvedValue(expenseSummary);
      mockExpByCatFindMany.mockResolvedValue(expByCat);

      await getDashboardMetrics(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        popularProducts: products,
        salesSummary,
        purchaseSummary,
        expenseSummary,
        expenseByCategorySummary: [expect.objectContaining({ amount: '500' })],
      });
    });

    it('should return 500 on error', async () => {
      mockProductsFindMany.mockRejectedValue(new Error('DB'));

      await getDashboardMetrics(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error retrieving dashboard metrics',
      });
    });
  });

  /* ── getKpiMetrics ── */
  describe('getKpiMetrics', () => {
    it('should return KPI metrics', async () => {
      mockProductsCount.mockResolvedValue(50);
      mockUsersCount.mockResolvedValue(10);
      mockSalesAggregate
        .mockResolvedValueOnce({ _sum: { totalAmount: 1000 }, _count: 20 })
        .mockResolvedValueOnce({ _sum: { totalAmount: 800 } });
      mockExpensesAggregate
        .mockResolvedValueOnce({ _sum: { amount: 300 } })
        .mockResolvedValueOnce({ _sum: { amount: 250 } });
      mockQueryRaw.mockResolvedValue([{ count: BigInt(5) }]);

      await getKpiMetrics(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalProducts: 50,
          totalUsers: 10,
          totalRevenue: 1000,
          totalSalesCount: 20,
          lowStockCount: 5,
        })
      );
    });

    it('should return 500 on error', async () => {
      mockProductsCount.mockRejectedValue(new Error('DB'));

      await getKpiMetrics(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── getSalesAggregation ── */
  describe('getSalesAggregation', () => {
    it('should return daily aggregation', async () => {
      mockReq.query = { timeframe: 'daily' };
      const sales = [
        { timestamp: new Date('2025-01-01'), totalAmount: 100 },
        { timestamp: new Date('2025-01-01'), totalAmount: 200 },
        { timestamp: new Date('2025-01-02'), totalAmount: 150 },
      ];
      mockSalesFindMany.mockResolvedValue(sales);

      await getSalesAggregation(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ date: '2025-01-01', totalValue: 300 }),
          expect.objectContaining({ date: '2025-01-02', totalValue: 150 }),
        ])
      );
    });

    it('should default to weekly timeframe', async () => {
      mockSalesFindMany.mockResolvedValue([]);

      await getSalesAggregation(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on error', async () => {
      mockSalesFindMany.mockRejectedValue(new Error('DB'));

      await getSalesAggregation(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── getLowStockProducts ── */
  describe('getLowStockProducts', () => {
    it('should return low stock products from raw query', async () => {
      const lowStock = [
        {
          productId: 'p1',
          name: 'W',
          stockQuantity: 2,
          stockThreshold: 10,
          price: 5,
        },
      ];
      mockQueryRaw.mockResolvedValue(lowStock);

      await getLowStockProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(lowStock);
    });

    it('should return 500 on error', async () => {
      mockQueryRaw.mockRejectedValue(new Error('DB'));

      await getLowStockProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  /* ── sendLowStockEmail ── */
  describe('sendLowStockEmail', () => {
    it('should send email and return result', async () => {
      const products = [
        {
          productId: 'p1',
          name: 'W',
          stockQuantity: 2,
          stockThreshold: 10,
          price: 5,
        },
      ];
      mockReq.body = { email: 'user@test.com' };
      mockQueryRaw.mockResolvedValue(products);
      mockSendLowStockAlert.mockResolvedValue({
        messageId: 'msg-1',
        previewUrl: 'http://preview',
      });

      await sendLowStockEmail(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('user@test.com'),
          messageId: 'msg-1',
          productsCount: 1,
        })
      );
    });

    it('should use ALERT_EMAIL when no email in body', async () => {
      mockReq.body = {};
      const products = [
        {
          productId: 'p1',
          name: 'W',
          stockQuantity: 2,
          stockThreshold: 10,
          price: 5,
        },
      ];
      mockQueryRaw.mockResolvedValue(products);
      mockSendLowStockAlert.mockResolvedValue({ messageId: 'msg-2' });

      await sendLowStockEmail(mockReq as Request, mockRes as Response);

      expect(mockSendLowStockAlert).toHaveBeenCalledWith(
        'admin@test.com',
        products
      );
    });

    it('should return message when no low stock products', async () => {
      mockReq.body = { email: 'user@test.com' };
      mockQueryRaw.mockResolvedValue([]);

      await sendLowStockEmail(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'No low stock products — no email sent.',
      });
    });

    it('should return 500 on error', async () => {
      mockReq.body = { email: 'user@test.com' };
      mockQueryRaw.mockRejectedValue(new Error('DB'));

      await sendLowStockEmail(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
