// src/controllers/recipesController.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Recipe, type IRecipe } from '../models/Recipe.js';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

// GET /api/v1/recipes
export const getAllRecipes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
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
export const getAllRecipes = asyncHandler(async (req, res): Promise<void> => {
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
});

// GET /api/v1/recipes/:id
export const getRecipeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validatedParams;
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new NotFoundError('Receptet hittades inte');
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/recipes
export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recipe = await Recipe.create(req.validatedBody);
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/recipes/:id
export const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validatedParams;
    const recipe = await Recipe.findByIdAndUpdate(
      id,
      req.validatedBody,
      { new: true, runValidators: true }
    );
    if (!recipe) throw new NotFoundError('Receptet hittades inte');
    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/recipes/:id
export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validatedParams;
    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) throw new NotFoundError('Receptet hittades inte');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/recipes/:id/fork
export const forkRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.validatedParams;
    const original = await Recipe.findById(id);
    if (!original) throw new NotFoundError('Receptet hittades inte');

  const forkedRecipe = await Recipe.create({
    title: original.title,
    createdBy: userId,
    ingredients: original.ingredients,
    steps: original.steps,
    originalRef: original._id,
  });

  res.status(201).json(forkedRecipe);
});
