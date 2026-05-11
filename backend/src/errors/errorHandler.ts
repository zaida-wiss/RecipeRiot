import { Request, Response, NextFunction } from 'express';
import { AppError } from './appError';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        name: err.name,
        message: err.message,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
    },
  });
}