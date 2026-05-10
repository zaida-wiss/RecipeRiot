import {RequestHandler } from "express";
import {z } from "zod";
import mongoose from "mongoose";
import { AppError } from "./errorHandler";

const objectIdParamsSchema = z.object({
  id: z.string().refine((id) => mongoose.isValidObjectId(id), {
    message: "Ogiltigt id-format.",
  }),
});


const validateObjectIdParam: RequestHandler = (req, _res, next) => {
  const result = objectIdParamsSchema.safeParse(req.params);

  if (!result.success) {
    return next(new AppError(result.error.issues[0].message, 400));
  }

  req.params = result.data;
  return next();
};

export {validateObjectIdParam };
