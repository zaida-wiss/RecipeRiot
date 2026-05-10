import { ErrorRequestHandler } from "express";

export class AppError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || "Något gick fel på servern";

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
};


export default errorHandler;