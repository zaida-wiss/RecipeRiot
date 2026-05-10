import { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "./errorHandler";

// Detta schema beskriver en komplett recipe-body för POST och PUT.
const recipeSchema = z.object({
  title: z.string().min(1, "title krävs"),
  createdBy: z.string().min(1, "createdBy krävs"),
  ingredients: z.array(z.string(), "ingredients måste vara en array"),
  steps: z.array(z.string(), "steps måste vara en array"),
});

// PATCH får skicka delar av receptet, men inte en helt tom body.
const updateRecipeFieldSchema = recipeSchema.partial().refine(
  (data) =>
    data.title !== undefined ||
    data.createdBy !== undefined ||
    data.ingredients !== undefined ||
    data.steps !== undefined,
  "Skicka minst ett fält att uppdatera."
);

// Vi visar första valideringsfelet för klienten och faller tillbaka på ett generellt fel.
const getValidationMessage = (error: z.ZodError) => {
  return error.issues[0]?.message ?? "Ogiltig data";
};

const validateCreateRecipe: RequestHandler = (req, _res, next) => {
  // safeParse kontrollerar req.body mot schemat utan att krascha requesten.
  const result = recipeSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  // Controllern får bara arbeta vidare med validerad data.
  req.body = result.data;
  return next();
};

const validateUpdateRecipeObject: RequestHandler = (req, _res, next) => {
  // PUT betyder hel ersättning, därför krävs samma fält som vid create.
  const result = recipeSchema.safeParse(req.body);

  if (!result.success) {
    return next(new AppError(getValidationMessage(result.error), 400));
  }

  req.body = result.data;
  return next();
};

const validateUpdateRecipeField: RequestHandler = (req, _res, next) => {
  // PATCH tillåter ett eller flera fält, så länge minst ett skickas.
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
