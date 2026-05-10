import { ErrorRequestHandler } from "express";

// Egen felklass så controllers och validation middleware kan skicka med statuskod.
export class AppError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Central error handler: Express hamnar här när vi anropar next(error).
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  // AppError har egen status, andra oväntade fel blir 500 Internal Server Error.
  const status = error.status || 500;
  const message = error.message || "Något gick fel på servern";

  // Alla fel får samma JSON-struktur tillbaka till klienten.
  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};


export default errorHandler;
