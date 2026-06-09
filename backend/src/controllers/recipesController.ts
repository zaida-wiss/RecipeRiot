// src/controllers/recipesController.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Recipe, type IRecipe } from '../models/Recipe.js';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

// helpers
type AsyncController = (req: Request, res: Response) => Promise<void>;

//Fångar fel i async controllers och skickar dem vidare till Express errorHandler.
const asyncHandler = (handler: AsyncController): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void handler(req, res).catch(next);
  };
};

// Hjälper oss att söka på text utan att specialtecken blir regex-kod.
const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const buildRecipeFilter = (search?: string) => {
  if (!search) return {};
  const textMatch = { $regex: escapeRegex(search), $options: 'i' };
  return { $or: [{ title: textMatch }, { 'ingredients.name': textMatch }] };
};

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.user) throw new UnauthorizedError('Autentisering krävs');
  return req.user.id;
};

const getRecipeOrThrow = async (id: string): Promise<IRecipe> => {
  const recipe = await Recipe.findOne({ _id: id, deletedAt: null });
  if (!recipe) throw new NotFoundError('Receptet hittades inte');
  return recipe;
};

const assertRecioeOwnerOrAdmin = (recipe: IRecipe, req: Request, message: string): void => {
  if (!req.user) throw new UnauthorizedError('Autentiering krävs');
  const isOwner = recipe.createdBy.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) throw new ForbiddenError(message);
};

const assertRecipeOwner = (recipe: IRecipe, userId: string, message: string): void => {
  if (recipe.createdBy.toString() !== userId) throw new ForbiddenError(message);
};

const getOwnedRecipeFromRequest = async (req: Request, forbiddenMessage: string): Promise<IRecipe> => {
  const userId = getAuthenticatedUserId(req);
  const { id } = req.validatedParams;
  const recipe = await getRecipeOrThrow(id);
  assertRecipeOwner(recipe, userId, forbiddenMessage);
  return recipe;
};

//Routes
// GET /api/v1/recipes
export const getAllRecipes = asyncHandler(async (req, res): Promise<void> => {
  const { page, limit, search } = req.validatedQuery;
  const filter = { ...buildRecipeFilter(search), deletedAt: null };
  const skip = (page - 1) * limit;

  const [recipes, total] = await Promise.all([
    Recipe.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Recipe.countDocuments(filter),
  ]);

  res.json({
    data: recipes,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/v1/recipes/:id
export const getRecipeById = asyncHandler(async (req, res): Promise<void> => {
  const { id } = req.validatedParams;
  const recipe = await getRecipeOrThrow(id);
  res.json(recipe);
});

// POST /api/v1/recipes
export const createRecipe = asyncHandler(async (req, res): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  const recipe = await Recipe.create({
    ...req.validatedBody,
    createdBy: userId,
    createdByUsername: req.user?.username ?? 'Okänd',
  });
  res.status(201).json(recipe);
});

// PUT /api/v1/recipes/:id
export const updateRecipe = asyncHandler(async (req, res): Promise<void> => {
  const recipe = await getOwnedRecipeFromRequest(req, 'Du får bara uppdatera dina egna recept');
  Object.assign(recipe, req.validatedBody);
  await recipe.save();
  res.json(recipe);
});

// DELETE /api/v1/recipes/:id
export const deleteRecipe = asyncHandler(async (req, res): Promise<void> => {
  const { id } = req.validatedParams;
  const recipe = await getRecipeOrThrow(id);
  assertRecioeOwnerOrAdmin(recipe, req, 'Du får bara radera dina egna recept.');
  recipe.deletedAt = new Date();
  await recipe.save();
  res.status(204).send();
});

// POST /api/v1/recipes/:id/fork
export const forkRecipe = asyncHandler(async (req, res): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  const { id } = req.validatedParams;
  const original = await getRecipeOrThrow(id);
  const forkedRecipe = await Recipe.create({
    title: original.title,
    createdBy: userId,
    createdByUsername: req.user?.username ?? 'Okänd',
    imageUrl: original.imageUrl,
    time: original.time,
    difficulty: original.difficulty,
    tags: original.tags,
    ingredients: original.ingredients,
    steps: original.steps,
    originalRef: original._id,
  });
  res.status(201).json(forkedRecipe);
});
