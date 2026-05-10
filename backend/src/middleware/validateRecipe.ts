import { RequestHandler } from "express";
import { AppError } from "./errorHandler";

const hasRequiredRecipeFields = (
  title: unknown,
  createdBy: unknown,
  ingredients: unknown,
  steps: unknown
) => {
  const requiredTextFields = [title, createdBy];
  const requiredListFields = [ingredients, steps];

  return requiredTextFields.every(Boolean) && requiredListFields.every(Array.isArray);
};

const hasRecipeFieldToUpdate = (
  title: unknown,
  createdBy: unknown,
  ingredients: unknown,
  steps: unknown
) => {
  return [title, createdBy, ingredients, steps].some((field) => field !== undefined);
};

const validateCreateRecipe: RequestHandler = (req, _res, next) => {
  const { title, createdBy, ingredients, steps } = req.body;

  if (!hasRequiredRecipeFields(title, createdBy, ingredients, steps)) {
    return next(new AppError("title, createdBy, ingredients och steps krävs.", 400));
  }

  return next();
};

const validateUpdateRecipeObject: RequestHandler = (req, _res, next) => {
  const { title, createdBy, ingredients, steps } = req.body;

  if (!hasRequiredRecipeFields(title, createdBy, ingredients, steps)) {
    return next(new AppError("title, createdBy, ingredients och steps krävs.", 400));
  }

  return next();
};

const validateUpdateRecipeField: RequestHandler = (req, _res, next) => {
  const { title, createdBy, ingredients, steps } = req.body;

  if (!hasRecipeFieldToUpdate(title, createdBy, ingredients, steps)) {
    return next(new AppError("Skicka minst ett fält att uppdatera.", 400));
  }

  return next();
};

export {
  validateCreateRecipe,
  validateUpdateRecipeObject,
  validateUpdateRecipeField,
};
