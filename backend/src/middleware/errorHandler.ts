// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

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
  if ((err as AppError).isOperational) {
    console.warn(`[AppError] ${req.method} ${req.path} — ${err.message}`);
  } else {
    console.error('[ALLVARLIGT FEL]', {
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
    });
  }

  // ─── Förväntade applikationsfel (NotFoundError, ConflictError osv.) ───────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(isDevelopment && { stack: err.stack }),
    });
    return;
  }

  // ─── Mongoose ValidationError ─────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    const errors = Object.values(mongooseErr.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    res.status(400).json({ message: 'Valideringsfel', errors });
    return;
  }

  // ─── ogiltigt ObjectId ───────────────────────────────
  if (err.name === 'CastError') {
    res.status(400).json({ message: 'Ogiltigt ID-format' });
    return;
  }

  // ───  exponera aldrig detaljer i produktion ──────────────
  res.status(500).json({
    message: isDevelopment
      ? err.message
      : 'Ett oväntat serverfel inträffade',
    ...(isDevelopment && { stack: err.stack }),
  });
}