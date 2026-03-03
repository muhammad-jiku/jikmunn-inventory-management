/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { sendError } from '../lib/apiResponse';
import env from '../lib/env';
import { sendLowStockAlert } from '../lib/mailer';
import prisma from '../lib/prisma';

/**
 * Retrieve dashboard metrics: popular products, sales/purchase/expense summaries.
 * @param req - Express request
 * @param res - Express response with aggregated dashboard data
 */
export const getDashboardMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const popularProducts = await prisma.products.findMany({
      take: 15,
      orderBy: {
        stockQuantity: 'desc',
      },
    });
    const salesSummary = await prisma.salesSummary.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
    });
    const purchaseSummary = await prisma.purchaseSummary.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
    });
    const expenseSummary = await prisma.expenseSummary.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
    });
    const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany(
      {
        take: 5,
        orderBy: {
          date: 'desc',
        },
      }
    );
    const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
      (item) => ({
        ...item,
        amount: item.amount.toString(),
      })
    );

    res.json({
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategorySummary,
    });
  } catch (_error) {
    sendError(res, 500, 'Error retrieving dashboard metrics');
  }
};

/**
 * Retrieve KPI metrics: revenue, expenses, product/user counts, low stock count.
 * Compares current 30-day window against prior 30-day window for change %.
 * @param _req - Express request (unused)
 * @param res - Express response with KPI data
 */
export const getKpiMetrics = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      totalUsers,
      currentSales,
      previousSales,
      currentExpenses,
      previousExpenses,
      lowStockProducts,
    ] = await Promise.all([
      prisma.products.count(),
      prisma.users.count(),
      prisma.sales.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: { timestamp: { gte: thirtyDaysAgo } },
      }),
      prisma.sales.aggregate({
        _sum: { totalAmount: true },
        where: {
          timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      prisma.expenses.aggregate({
        _sum: { amount: true },
        where: { timestamp: { gte: thirtyDaysAgo } },
      }),
      prisma.expenses.aggregate({
        _sum: { amount: true },
        where: {
          timestamp: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count FROM "tblproducts"
        WHERE "stockQuantity" <= "stockThreshold"
      `,
    ]);

    const totalRevenue = currentSales._sum.totalAmount ?? 0;
    const prevRevenue = previousSales._sum.totalAmount ?? 0;
    const revenueChange =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const totalExpenseAmount = currentExpenses._sum.amount ?? 0;
    const prevExpenseAmount = previousExpenses._sum.amount ?? 0;
    const expenseChange =
      prevExpenseAmount > 0
        ? ((totalExpenseAmount - prevExpenseAmount) / prevExpenseAmount) * 100
        : 0;

    res.json({
      totalRevenue,
      revenueChange: Math.round(revenueChange * 100) / 100,
      totalProducts,
      totalUsers,
      totalExpenses: totalExpenseAmount,
      expenseChange: Math.round(expenseChange * 100) / 100,
      totalSalesCount: currentSales._count,
      lowStockCount: Number(lowStockProducts[0]?.count ?? 0),
    });
  } catch (_error) {
    sendError(res, 500, 'Error retrieving KPI metrics');
  }
};

/**
 * Aggregate sales by timeframe (daily / weekly / monthly).
 * Returns grouped totals with period-over-period change percentages.
 * @param req - Express request (query: timeframe? — daily|weekly|monthly)
 * @param res - Express response with sales aggregation array
 */
export const getSalesAggregation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const timeframe = (req.query.timeframe as string) || 'weekly';

    let dateFormat: string;
    let daysBack: number;

    switch (timeframe) {
      case 'daily':
        dateFormat = 'YYYY-MM-DD';
        daysBack = 30;
        break;
      case 'monthly':
        dateFormat = 'YYYY-MM';
        daysBack = 365;
        break;
      case 'weekly':
      default:
        dateFormat = 'IYYY-IW';
        daysBack = 90;
        break;
    }

    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

    const sales = await prisma.sales.findMany({
      where: { timestamp: { gte: startDate } },
      orderBy: { timestamp: 'asc' },
    });

    // Group sales by period
    const grouped: Record<string, { totalValue: number; date: string }> = {};

    for (const sale of sales) {
      const d = new Date(sale.timestamp);
      let key: string;

      if (timeframe === 'daily') {
        key = d.toISOString().slice(0, 10);
      } else if (timeframe === 'monthly') {
        key = d.toISOString().slice(0, 7);
      } else {
        // weekly – use ISO week start (Monday)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const weekStart = new Date(d);
        weekStart.setDate(diff);
        key = weekStart.toISOString().slice(0, 10);
      }

      if (!grouped[key]) {
        grouped[key] = { totalValue: 0, date: key };
      }
      grouped[key].totalValue += sale.totalAmount;
    }

    const data = Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Compute change percentage for each period
    const result = data.map((item, i) => ({
      ...item,
      changePercentage:
        i > 0 && data[i - 1].totalValue > 0
          ? Math.round(
              ((item.totalValue - data[i - 1].totalValue) /
                data[i - 1].totalValue) *
                10000
            ) / 100
          : 0,
    }));

    res.json(result);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving sales aggregation');
  }
};

/**
 * Generate a comprehensive report: P&L, stock valuation, top products, sales trend.
 * @param req - Express request (query: startDate?, endDate?)
 * @param res - Express response with full report object
 */
export const getReports = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    const dateFilter = { gte: startDate, lte: endDate };

    const [
      salesAgg,
      purchasesAgg,
      expensesAgg,
      topProducts,
      stockValuation,
      salesByDate,
    ] = await Promise.all([
      // Total sales in period
      prisma.sales.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: { timestamp: dateFilter },
      }),
      // Total purchases in period
      prisma.purchases.aggregate({
        _sum: { totalCost: true },
        _count: true,
        where: { timestamp: dateFilter },
      }),
      // Total expenses in period
      prisma.expenses.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { timestamp: dateFilter },
      }),
      // Top selling products
      prisma.sales.groupBy({
        by: ['productId'],
        _sum: { totalAmount: true, quantity: true },
        where: { timestamp: dateFilter },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 10,
      }),
      // Stock valuation
      prisma.$queryRaw<{ totalValue: number }[]>`
        SELECT COALESCE(SUM("price" * "stockQuantity"), 0) as "totalValue"
        FROM "tblproducts"
      `,
      // Sales trend by day
      prisma.sales.findMany({
        where: { timestamp: dateFilter },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true, totalAmount: true },
      }),
    ]);

    // Enrich top products with names
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.products.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, name: true, price: true, stockQuantity: true },
    });
    const productMap = new Map(products.map((p) => [p.productId, p]));

    const topSellingProducts = topProducts.map((tp) => ({
      productId: tp.productId,
      name: productMap.get(tp.productId)?.name ?? 'Unknown',
      totalRevenue: tp._sum.totalAmount ?? 0,
      totalQuantity: tp._sum.quantity ?? 0,
    }));

    // Aggregate sales trend by day
    const salesTrend: Record<string, number> = {};
    for (const s of salesByDate) {
      const day = new Date(s.timestamp).toISOString().slice(0, 10);
      salesTrend[day] = (salesTrend[day] ?? 0) + s.totalAmount;
    }
    const salesTrendData = Object.entries(salesTrend)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalRevenue = salesAgg._sum.totalAmount ?? 0;
    const totalCost = purchasesAgg._sum.totalCost ?? 0;
    const totalExpenses = expensesAgg._sum.amount ?? 0;

    res.json({
      profitAndLoss: {
        totalRevenue,
        totalCost,
        totalExpenses,
        grossProfit: totalRevenue - totalCost,
        netProfit: totalRevenue - totalCost - totalExpenses,
      },
      stockValuation: Number(stockValuation[0]?.totalValue ?? 0),
      topSellingProducts,
      salesTrend: salesTrendData,
      summary: {
        salesCount: salesAgg._count,
        purchasesCount: purchasesAgg._count,
        expensesCount: expensesAgg._count,
      },
    });
  } catch (_error) {
    sendError(res, 500, 'Error retrieving reports');
  }
};

/**
 * Retrieve products whose stock is at or below their threshold.
 * Uses raw SQL query for direct threshold comparison.
 * @param _req - Express request (unused)
 * @param res - Express response with low stock products array
 */
export const getLowStockProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await prisma.$queryRaw<
      {
        productId: string;
        name: string;
        stockQuantity: number;
        stockThreshold: number;
        price: number;
      }[]
    >`
      SELECT "productId", "name", "stockQuantity", "stockThreshold", "price"
      FROM "tblproducts"
      WHERE "stockQuantity" <= "stockThreshold"
      ORDER BY "stockQuantity" ASC
    `;

    res.json(products);
  } catch (_error) {
    sendError(res, 500, 'Error retrieving low stock products');
  }
};

/**
 * Send a low stock alert email.
 * Falls back to ALERT_EMAIL env var if no email in request body.
 * Skips sending if no products are below threshold.
 * @param req - Express request (body: email?)
 * @param res - Express response with send result or skip message
 */
export const sendLowStockEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };
    const recipient = email || env.ALERT_EMAIL;

    if (!recipient) {
      sendError(
        res,
        400,
        'No recipient email provided. Pass "email" in the request body or set ALERT_EMAIL env var.'
      );
      return;
    }

    const products = await prisma.$queryRaw<
      {
        productId: string;
        name: string;
        stockQuantity: number;
        stockThreshold: number;
        price: number;
      }[]
    >`
      SELECT "productId", "name", "stockQuantity", "stockThreshold", "price"
      FROM "tblproducts"
      WHERE "stockQuantity" <= "stockThreshold"
      ORDER BY "stockQuantity" ASC
    `;

    if (products.length === 0) {
      res.json({ message: 'No low stock products — no email sent.' });
      return;
    }

    const result = await sendLowStockAlert(recipient, products);

    res.json({
      message: `Low stock alert email sent to ${recipient}`,
      messageId: result.messageId,
      previewUrl: result.previewUrl || undefined,
      productsCount: products.length,
    });
  } catch (_error) {
    sendError(res, 500, 'Error sending low stock email alert');
  }
};
