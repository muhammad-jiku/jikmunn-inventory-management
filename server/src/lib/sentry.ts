import * as Sentry from '@sentry/node';

import env from './env';
import logger from './logger';

/**
 * Initialize Sentry error tracking for the Express server.
 * Only activates when `SENTRY_DSN` environment variable is set.
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.info('Sentry DSN not configured — error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: env.NODE_ENV,
    release: `inventory-server@${process.env.npm_package_version ?? '1.0.0'}`,

    // Performance monitoring — sample 20% in production, 100% in dev
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 1.0,

    // Filter out health check noise
    beforeSend(event) {
      if (event.request?.url?.includes('/health')) {
        return null;
      }
      return event;
    },

    integrations: [Sentry.httpIntegration(), Sentry.expressIntegration()],
  });

  logger.info('Sentry error tracking initialized');
}

/**
 * Sentry error handler middleware for Express.
 * Must be added AFTER all routes and BEFORE the custom error handler.
 */
export const sentryErrorHandler = Sentry.setupExpressErrorHandler;

export { Sentry };
