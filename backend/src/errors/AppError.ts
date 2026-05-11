// src/errors/AppError.ts

// ─── Basklass för alla förväntade applikationsfel ─────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean; // skiljer appfel från programmeringsfel
  public readonly errors?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode: number,
    errors?: { field: string; message: string }[]
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 400 – Felaktig indata från klienten ─────────────────────────────────────
export class ValidationError extends AppError {
  constructor(
    message = 'Valideringsfel',
    errors?: { field: string; message: string }[]
  ) {
    super(message, 400, errors);
  }
}

// ─── 404 – Resursen hittades inte ────────────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(message = 'Resursen hittades inte') {
    super(message, 404);
  }
}

// ─── 401 – Kräver autentisering ───────────────────────────────────────────────
export class UnauthorizedError extends AppError {
  constructor(message = 'Autentisering krävs') {
    super(message, 401);
  }
}

// ─── 403 – Autentiserad men saknar behörighet ────────────────────────────────
export class ForbiddenError extends AppError {
  constructor(message = 'Åtkomst nekad') {
    super(message, 403);
  }
}

// ─── 409 – Konflikt, t.ex. e-post redan registrerad ──────────────────────────
export class ConflictError extends AppError {
  constructor(message = 'Resursen existerar redan') {
    super(message, 409);
  }
}