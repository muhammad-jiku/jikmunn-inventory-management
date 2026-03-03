import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
/* LIB IMPORTS */
import env from './lib/env'; // dotenv.config() is called inside env.ts
import logger, { morganStream } from './lib/logger';
import { initSentry, sentryErrorHandler } from './lib/sentry';
import { swaggerSpec } from './lib/swagger';
/* MIDDLEWARE IMPORTS */
import { apiLimiter } from './middleware/rateLimiter';
/* ROUTE IMPORTS */
import auditLogRoutes from './routes/auditLogRoutes';
import authRoutes from './routes/authRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import expenseRoutes from './routes/expenseRoutes';
import importRoutes from './routes/importRoutes';
import metricsRoutes from './routes/metricsRoutes';
import orderRoutes from './routes/orderRoutes';
import productRoutes from './routes/productRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import salesRoutes from './routes/salesRoutes';
import supplierRoutes from './routes/supplierRoutes';
import userRoutes from './routes/userRoutes';
import warehouseRoutes from './routes/warehouseRoutes';
/* MIDDLEWARE IMPORTS (auth) */
import { authenticate, authorize } from './middleware/auth';
import { metricsMiddleware } from './middleware/metrics';
import { performanceMiddleware } from './middleware/performance';

/* CONFIGURATIONS */
initSentry(); // Must be called before any other middleware
const app = express();
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(morgan('common', { stream: morganStream }));
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);
app.use(apiLimiter);
app.use(metricsMiddleware);
app.use(performanceMiddleware);

/* HEALTH CHECK */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* SWAGGER API DOCS */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});

/* AUTH ROUTES (public) */
app.use('/api/v1/auth', authRoutes);
app.use('/auth', authRoutes);

/* API v1 ROUTES (protected) */
app.use('/api/v1/dashboard', authenticate, dashboardRoutes);
app.use('/api/v1/products', authenticate, productRoutes);
app.use('/api/v1/users', authenticate, authorize('admin'), userRoutes);
app.use('/api/v1/expenses', authenticate, expenseRoutes);
app.use('/api/v1/sales', authenticate, salesRoutes);
app.use('/api/v1/purchases', authenticate, purchaseRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/imports', importRoutes);
app.use('/api/v1/metrics', metricsRoutes);

/* LEGACY ROUTES (protected, backward compatibility) */
app.use('/dashboard', authenticate, dashboardRoutes);
app.use('/products', authenticate, productRoutes);
app.use('/users', authenticate, authorize('admin'), userRoutes);
app.use('/expenses', authenticate, expenseRoutes);
app.use('/sales', authenticate, salesRoutes);
app.use('/purchases', authenticate, purchaseRoutes);
app.use('/audit-logs', auditLogRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/orders', orderRoutes);
app.use('/warehouses', warehouseRoutes);
app.use('/imports', importRoutes);
app.use('/metrics', metricsRoutes);

/* SENTRY ERROR HANDLER — must be before the global error handler */
sentryErrorHandler(app);

/* GLOBAL ERROR HANDLER */
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error(`Unhandled error: ${err.message}`, {
      stack: err.stack,
    });
    res.status(500).json({ message: 'Internal Server Error' });
  }
);

/* SERVER */
const port = env.PORT;
app.listen(port, '0.0.0.0', () => {
  logger.info(`Server running on port ${port} [${env.NODE_ENV}]`);
});
