// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

// Hjälpfunktioner
function logError(err: Error, req: Request): void {
  if ((err as AppError).isOperational) {
    console.warn(`[AppError] ${req.method} ${req.path} — ${err.message}`);
    return;
  }

  console.error('[ALLVARLIGT FEL]', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  });
}

function sendAppError(err: AppError, res: Response, isDevelopment: boolean): void {
  res.status(err.statusCode).json({
    message: err.message,
    ...(err.errors && { errors: err.errors }),
    ...(isDevelopment && { stack: err.stack }),
  });
}

function sendMongooseValidationError(err: Error, res: Response): void {
  const mongooseErr = err as any;

  const errors = Object.values(mongooseErr.errors).map((e: any) => ({
    field: e.path,
    message: e.message,
  }));

  res.status(400).json({ message: 'Valideringsfel', errors });
}

function sendUnexpectedError(
  err: Error,
  res: Response,
  isDevelopment: boolean
): void {
  res.status(500).json({
    message: isDevelopment
      ? err.message
      : 'Ett oväntat serverfel inträffade',
    ...(isDevelopment && { stack: err.stack }),
  });
}

// next krävs som parameter av Express för att identifiera detta som felhanterare,
// även om vi inte anropar den vi stänger av varningen med _next
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // ─── Intern loggning — alltid fullständig ─────────────────────────────────
  logError(err, req);

  // ─── Förväntade applikationsfel (NotFoundError, ConflictError osv.) ───────
  if (err instanceof AppError) {
    sendAppError(err, res, isDevelopment);
    return;
  }

  // ─── Mongoose ValidationError ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    sendMongooseValidationError(err, res);
    return;
  }

  // ─── Mongoose CastError, t.ex. ogiltigt ObjectId ─────────────────────────────
  if (err.name === 'CastError') {
    res.status(400).json({ message: 'Ogiltigt ID-format' });
    return;
  }

  // ───  exponera aldrig detaljer i produktion ──────────────
  sendUnexpectedError(err, res, isDevelopment);
}
