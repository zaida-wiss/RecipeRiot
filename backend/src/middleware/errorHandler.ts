import { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    error: {
      message: "Något gick fel på servern",
      status: 500,
    },
  });
};

export default errorHandler;