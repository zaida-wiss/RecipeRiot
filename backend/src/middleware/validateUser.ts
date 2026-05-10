import { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "./errorHandler";

// Zod beskriver vilken form request body måste ha innan controllern får köra.
const createUserSchema = z.object({
  username: z.string().min(1, "username krävs"),
  email: z.email("email måste vara giltig"),
  password: z.string().min(1, "password krävs"),
});

// PATCH tillåter valfria fält, men refine ser till att minst ett fält skickas.
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

// Vi skickar första Zod-felet vidare till vår centrala errorHandler.
const getValidationMessage = (error: z.ZodError) => {
  return error.issues[0]?.message ?? "Ogiltig data";
};

const validateCreateUser: RequestHandler = (req, _res, next) => {
  // safeParse kastar inget exception, utan returnerar success true/false.
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  // Efter validering ersätter vi req.body med den typade och godkända datan.
  req.body = result.data;
  return next();
};

const validateUpdateUserObject: RequestHandler = (req, _res, next) => {
  // PUT använder samma krav som create: username, email och password krävs.
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  req.body = result.data;
  return next();
};

const validateUpdateUserField: RequestHandler = (req, _res, next) => {
  // PATCH använder ett separat schema eftersom alla fält är frivilliga.
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
