import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return stack
    ? `${timestamp} [${level}]: ${message}\n${stack}${metaStr}`
    : `${timestamp} [${level}]: ${message}${metaStr}`;
});

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // In production, use structured JSON logs for log aggregators
    isProduction ? json() : logFormat
  ),
  defaultMeta: {
    service: 'inventory-api',
    ...(isProduction ? { pid: process.pid } : {}),
  },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), json())
        : combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            logFormat
          ),
    }),
  ],
  // Don't exit on uncaught exceptions — let the error handler do its job
  exitOnError: false,
});

// In production, also log to rotating files
if (isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 10,
      tailable: true,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 10,
      tailable: true,
    })
  );
}

// Handle uncaught exceptions and rejections via Winston
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);
logger.rejections.handle(
  new winston.transports.File({ filename: 'logs/rejections.log' })
);

// Stream for Morgan integration
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
