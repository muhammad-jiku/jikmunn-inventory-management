import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
/* LIB IMPORTS */
import env from './lib/env'; // dotenv.config() is called inside env.ts
import logger, { morganStream } from './lib/logger';
/* MIDDLEWARE IMPORTS */
import { apiLimiter } from './middleware/rateLimiter';
/* ROUTE IMPORTS */
import dashboardRoutes from './routes/dashboardRoutes';
import expenseRoutes from './routes/expenseRoutes';
import productRoutes from './routes/productRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import salesRoutes from './routes/salesRoutes';
import userRoutes from './routes/userRoutes';

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
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

/* HEALTH CHECK */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* API v1 ROUTES */
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/purchases', purchaseRoutes);

/* LEGACY ROUTES (backward compatibility) */
app.use('/dashboard', dashboardRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/sales', salesRoutes);
app.use('/purchases', purchaseRoutes);

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
