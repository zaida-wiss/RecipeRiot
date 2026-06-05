import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";

type HealthResponse = {
  status: "ok";
  environment: string;
  database: "connected" | "disconnected";
  uptime: number;
}

export const getHealth = async (
  _req: Request,
  res: Response<HealthResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const database =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    res.json({
      status: "ok",
      environment: env.NODE_ENV,
      database,
      uptime: process.uptime(),
    });
  } catch (error) {
    next(error);
  }
};