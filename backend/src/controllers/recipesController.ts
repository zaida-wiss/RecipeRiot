// src/controllers/recipesController.ts
import { Request, Response, NextFunction } from 'express';
import { Recipe, IRecipe } from '../models/Recipe';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../errors/AppError';

// Helpers
// Hjälper oss att söka på text utan att specialtecken blir regex-kod.
const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const buildRecipeFilter = (search?: string) => {
  if (!search) {
    return {};
  }

  const textMatch = { $regex: escapeRegex(search), $options: 'i' };

  return {
    $or: [
      { title: textMatch },
      { 'ingredients.name': textMatch },
    ],
  };
};

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user) {
    throw new UnauthorizedError('Autentisering krävs');
  }

  return req.user.id;
};

const getRecipeOrThrow = async (id: string): Promise<IRecipe> => {
  const recipe = await Recipe.findById(id);

  if (!recipe) {
    throw new NotFoundError('Receptet hittades inte');
  }

  return recipe;
};

const assertRecipeOwner = (
  recipe: IRecipe,
  userId: string,
  message: string
): void => {
  if (recipe.createdBy.toString() !== userId) {
    throw new ForbiddenError(message);
  }
};

const getOwnedRecipeFromRequest = async (
  req: Request,
  forbiddenMessage: string
): Promise<IRecipe> => {
  const userId = getAuthenticatedUserId(req);
  const { id } = req.validatedParams;
  const recipe = await getRecipeOrThrow(id);

  assertRecipeOwner(recipe, userId, forbiddenMessage);

  return recipe;
};

// Routes
// GET /api/v1/recipes
export const getAllRecipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, search } = req.validatedQuery;
    const filter = buildRecipeFilter(search);
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Recipe.countDocuments(filter),
    ]);

    res.json({
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/recipes/:id
export const getRecipeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const recipe = await getRecipeOrThrow(id);

    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/recipes
export const createRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const recipe = await Recipe.create({
      ...req.validatedBody,
      createdBy: userId,
    });

    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/recipes/:id
export const updateRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipe = await getOwnedRecipeFromRequest(
      req,
      'Du får bara uppdatera dina egna recept'
    );

    Object.assign(recipe, req.validatedBody);
    await recipe.save();

    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/recipes/:id
export const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipe = await getOwnedRecipeFromRequest(
      req,
      'Du får bara radera dina egna recept'
    );

    await recipe.deleteOne();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/recipes/:id/fork
export const forkRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);
    const { id } = req.validatedParams;
    const original = await getRecipeOrThrow(id);

    const forkedRecipe = await Recipe.create({
      title: original.title,
      createdBy: userId,
      ingredients: original.ingredients,
      steps: original.steps,
      originalRef: original._id,
    });

    res.status(201).json(forkedRecipe);
  } catch (error) {
    next(error);
  }
};
