import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from './auth';

/**
 * Middleware that records API metrics (endpoint, method, status, latency) for each request.
 * Uses `res.on('finish')` to capture the response status after the route handler completes.
 */
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const latencyMs = Date.now() - start;
    const userId = (req as AuthRequest).user?.userId ?? null;

    // Fire-and-forget — never block the response
    prisma.apiMetric
      .create({
        data: {
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          latencyMs,
          userId,
        },
      })
      .catch(() => {
        // silently ignore
      });
  });

  next();
};
