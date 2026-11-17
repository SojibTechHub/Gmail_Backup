import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import config from '../config';

export const applySecurityMiddleware = (app: Express): void => {
  // Set security HTTP headers
  app.use(helmet());

  // Enable CORS
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Protect against HTTP Parameter Pollution attacks
  app.use(hpp());

  // Sanitize data against NoSQL injection
  app.use(mongoSanitize());

  // Compress response bodies
  app.use(compression());
};
