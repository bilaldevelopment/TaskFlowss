import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes/api.js';
import { errorHandler } from './middleware/error.js';

export function createExpressApp(): Express {
  const app = express();

  // Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // Request parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Mount versioned REST API
  app.use('/api/v1', apiRouter);

  // Global error handler
  app.use(errorHandler);

  return app;
}
