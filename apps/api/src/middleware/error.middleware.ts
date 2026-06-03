import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({ error: 'Internal server error' });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}