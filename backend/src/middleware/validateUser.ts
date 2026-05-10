import { RequestHandler } from "express";
import { AppError } from "./errorHandler";
import type { CreateUserBodyType, UpdateUserBodyType } from "../types/userType";

const hasRequiredUserFields = (
  username: unknown,
  email: unknown,
  password: unknown
) => Boolean(username && email && password);

const hasUserFieldToUpdate = (
  username: unknown,
  email: unknown,
  isActive: unknown
) => {
  return username !== undefined || email !== undefined || isActive !== undefined;
};

const validateCreateUser: RequestHandler = (req, _res, next) => {
  const { username, email, password } = req.body as CreateUserBodyType;

  if (!hasRequiredUserFields(username, email, password)) {
    return next(new AppError("username, email och password krävs", 400));
  }

  return next();
};

const validateUpdateUserObject: RequestHandler = (req, _res, next) => {
  const { username, email, password } = req.body as CreateUserBodyType;

  if (!hasRequiredUserFields(username, email, password)) {
    return next(new AppError("username, email och password krävs", 400));
  }

  return next();
};

const validateUpdateUserField: RequestHandler = (req, _res, next) => {
  const { username, email, isActive } = req.body as UpdateUserBodyType;

  if (!hasUserFieldToUpdate(username, email, isActive)) {
    return next(new AppError("Uppdatera användarnamn, email eller aktivitetsläge.", 400));
  }

  return next();
};

export {
  validateCreateUser,
  validateUpdateUserObject,
  validateUpdateUserField,
};
