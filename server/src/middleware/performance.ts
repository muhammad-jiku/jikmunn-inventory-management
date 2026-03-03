import { NextFunction, Request, Response } from 'express';

import logger from '../lib/logger';

/**
 * Performance monitoring middleware.
 * Tracks request duration, logs slow requests, and attaches timing headers.
 *
 * - Logs a warning for requests taking > 1000ms
 * - Logs an error for requests taking > 5000ms
 * - Adds `X-Response-Time` header to all responses
 * - Adds `Server-Timing` header for browser DevTools integration
 */
export function performanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const rounded = Math.round(durationMs * 100) / 100;

    // Set timing headers
    res.setHeader('X-Response-Time', `${rounded}ms`);
    res.setHeader('Server-Timing', `total;dur=${rounded}`);

    const info = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: rounded,
      contentLength: res.get('content-length') ?? '-',
      userAgent: req.get('user-agent')?.substring(0, 80),
    };

    if (rounded > 5000) {
      logger.error('CRITICAL SLOW REQUEST', info);
    } else if (rounded > 1000) {
      logger.warn('Slow request detected', info);
    } else if (process.env.NODE_ENV !== 'production') {
      logger.debug('Request completed', info);
    }
  });

  next();
}
