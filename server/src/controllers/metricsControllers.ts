import { Request, Response } from 'express';
import { sendError } from '../lib/apiResponse';
import prisma from '../lib/prisma';

/**
 * Get aggregated API metrics: total requests, avg latency, top endpoints, error rate.
 * Query params: hours (default 24) — look-back window.
 */
export const getApiMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const hours = Number(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const where = { createdAt: { gte: since } };

    const [
      totalRequests,
      avgLatency,
      errorCount,
      byEndpoint,
      byStatusCode,
      byUser,
    ] = await Promise.all([
      prisma.apiMetric.count({ where }),
      prisma.apiMetric.aggregate({ where, _avg: { latencyMs: true } }),
      prisma.apiMetric.count({ where: { ...where, statusCode: { gte: 400 } } }),
      prisma.apiMetric.groupBy({
        by: ['endpoint', 'method'],
        where,
        _count: true,
        _avg: { latencyMs: true },
        orderBy: { _count: { endpoint: 'desc' } },
        take: 20,
      }),
      prisma.apiMetric.groupBy({
        by: ['statusCode'],
        where,
        _count: true,
        orderBy: { _count: { statusCode: 'desc' } },
      }),
      prisma.apiMetric.groupBy({
        by: ['userId'],
        where: { ...where, userId: { not: null } },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    res.json({
      period: { hours, since: since.toISOString() },
      totalRequests,
      averageLatencyMs: Math.round(avgLatency._avg.latencyMs ?? 0),
      errorCount,
      errorRate:
        totalRequests > 0
          ? Math.round((errorCount / totalRequests) * 10000) / 100
          : 0,
      topEndpoints: byEndpoint.map((e) => ({
        endpoint: e.endpoint,
        method: e.method,
        requests: e._count,
        avgLatencyMs: Math.round(e._avg.latencyMs ?? 0),
      })),
      statusCodes: byStatusCode.map((s) => ({
        statusCode: s.statusCode,
        count: s._count,
      })),
      topUsers: byUser.map((u) => ({
        userId: u.userId,
        requests: u._count,
      })),
    });
  } catch (_error) {
    sendError(res, 500, 'Error retrieving API metrics');
  }
};
