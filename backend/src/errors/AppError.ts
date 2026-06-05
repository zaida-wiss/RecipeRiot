// src/errors/AppError.ts

// AppError är basklassen för fel som vi själva förväntar oss i API:t.
// Exempel: valideringsfel, saknad resurs, dubblett eller saknad behörighet.
// Dessa fel är "operational errors", alltså normala felfall som API:t ska svara snyggt på.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode: number,
    errors?: { field: string; message: string }[]
  ) {
    super(message);

    // Namnet blir klassnamnet, t.ex. "NotFoundError" eller "ValidationError".
    this.name = this.constructor.name;

    // HTTP-statuskoden som errorHandler använder i svaret.
    this.statusCode = statusCode;

    // Markerar att detta är ett förväntat appfel, inte ett oväntat programmeringsfel.
    this.isOperational = true;

    // Extra fältfel, används främst vid validering.
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
// Används när klienten skickar felaktig data.
// Exempel: saknad title, ogiltig email eller fel format på request body.
export class ValidationError extends AppError {
  constructor(
    message = 'Valideringsfel',
    errors?: { field: string; message: string }[]
  ) {
    super(message, 400, errors);
  }
}

// 404 Not Found
// Används när id-formatet är giltigt men resursen inte finns i databasen.
// Exempel: receptet eller användaren hittades inte.
export class NotFoundError extends AppError {
  constructor(message = 'Resursen hittades inte') {
    super(message, 404);
  }
}

// 401 Unauthorized
// Används när klienten inte är inloggad eller saknar giltig token.
export class UnauthorizedError extends AppError {
  constructor(message = 'Autentisering krävs') {
    super(message, 401);
  }
}

// 403 Forbidden
// Används när klienten är inloggad men saknar rätt behörighet.
// Exempel: vanlig user försöker göra admin-sak.
export class ForbiddenError extends AppError {
  constructor(message = 'Åtkomst nekad') {
    super(message, 403);
  }
}

// 409 Conflict
// Används när ny data krockar med något som redan finns.
// Exempel: email är redan registrerad.
export class ConflictError extends AppError {
  constructor(message = 'Resursen existerar redan') {
    super(message, 409);
  }
}