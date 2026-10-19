import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Unhandled Application Error:', err);

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'Internal server error occurred';

  res.status(statusCode).json({
    error: message,
    ...(config.isDev ? { stack: err.stack } : {}),
  });
}
