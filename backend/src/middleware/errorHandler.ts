import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

export class AppError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: {
        message: error.message,
        status: 400,
      },
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      error: {
        message: "Ogiltigt id-format.",
        status: 400,
      },
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      error: {
        message: "Värdet finns redan.",
        status: 409,
      },
    });
  }

  const status = error.status || 500;
  const message = error.message || "Något gick fel på servern";

  return res.status(status).json({
    error: {
      message,
      status,
    },
  });
};

export default errorHandler;
