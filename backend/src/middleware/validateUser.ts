import { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "./errorHandler";

const createUserSchema = z.object({
  username: z.string().min(1, "username krävs"),
  email: z.email("email måste vara giltig"),
  password: z.string().min(1, "password krävs"),
});

const updateUserFieldSchema = z
  .object({
    username: z.string().min(1, "username får inte vara tomt").optional(),
    email: z.email("email måste vara giltig").optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.username !== undefined ||
      data.email !== undefined ||
      data.isActive !== undefined,
    "Uppdatera användarnamn, email eller aktivitetsläge."
  );

const getValidationMessage = (error: z.ZodError) => {
  return error.issues[0]?.message ?? "Ogiltig data";
};

const validateCreateUser: RequestHandler = (req, _res, next) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  req.body = result.data;
  return next();
};

const validateUpdateUserObject: RequestHandler = (req, _res, next) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  req.body = result.data;
  return next();
};

const validateUpdateUserField: RequestHandler = (req, _res, next) => {
  const result = updateUserFieldSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  req.body = result.data;
  return next();
};

export {
  validateCreateUser,
  validateUpdateUserObject,
  validateUpdateUserField,
};
