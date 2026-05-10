import { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "./errorHandler";

const recipeSchema = z.object({
  title: z.string().min(1, "title krävs"),
  createdBy: z.string().min(1, "createdBy krävs"),
  ingredients: z.array(z.string(), "ingredients måste vara en array"),
  steps: z.array(z.string(), "steps måste vara en array"),
});

const updateRecipeFieldSchema = recipeSchema.partial().refine(
  (data) =>
    data.title !== undefined ||
    data.createdBy !== undefined ||
    data.ingredients !== undefined ||
    data.steps !== undefined,
  "Skicka minst ett fält att uppdatera."
);

const getValidationMessage = (error: z.ZodError) => {
  return error.issues[0]?.message ?? "Ogiltig data";
};

const validateCreateRecipe: RequestHandler = (req, _res, next) => {
  const result = recipeSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  req.body = result.data;
  return next();
};

const validateUpdateRecipeObject: RequestHandler = (req, _res, next) => {
  const result = recipeSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  req.body = result.data;
  return next();
};

const validateUpdateRecipeField: RequestHandler = (req, _res, next) => {
  const result = updateRecipeFieldSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  req.body = result.data;
  return next();
};

export {
  validateCreateRecipe,
  validateUpdateRecipeObject,
  validateUpdateRecipeField,
};
