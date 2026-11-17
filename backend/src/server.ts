import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import config from './config';
import connectDB, { disconnectDB } from './config/database';
import { seedDatabase } from './config/seed';
import routes from './routes';
import {
  applySecurityMiddleware,
  generalLimiter,
  errorHandler,
  AppError,
} from './middlewares';
import { logger } from './utils';

const app = express();

// Security headers and middlewares
applySecurityMiddleware(app);

// Request body and cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));

// HTTP logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Global rate limiting
app.use(generalLimiter);

// Mount API routes
app.use(config.apiPrefix, routes);

// 404 handler
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find endpoint ${req.method} ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(errorHandler);

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const server = app.listen(config.port, () => {
      logger.info(`=========================================`);
      logger.info(`  MailVault Backend API Server Running`);
      logger.info(`  Environment: ${config.env}`);
      logger.info(`  Port:        ${config.port}`);
      logger.info(`  API Prefix:  ${config.apiPrefix}`);
      logger.info(`  Health:      http://localhost:${config.port}${config.apiPrefix}/health`);
      logger.info(`=========================================`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
