// src/controllers/recipesController.ts
import { Request, Response, NextFunction } from 'express';
import { Recipe } from '../models/Recipe';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../errors/AppError';

// GET /api/v1/recipes
export const getAllRecipes = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
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
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new NotFoundError('Receptet hittades inte');
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
    if (!req.user) {
      throw new UnauthorizedError('Autentisering krävs');
    }

    const recipe = await Recipe.create({
      ...req.validatedBody,
      createdBy: req.user.id,
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
    if (!req.user) {
      throw new UnauthorizedError('Autentisering krävs');
    }

    const { id } = req.validatedParams;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      throw new NotFoundError('Receptet hittades inte');
    }

    if (recipe.createdBy.toString() !== req.user.id) {
      throw new ForbiddenError('Du får bara uppdatera dina egna recept');
    }

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
    if (!req.user) {
      throw new UnauthorizedError('Autentisering krävs');
    }

    const { id } = req.validatedParams;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      throw new NotFoundError('Receptet hittades inte');
    }

    if (recipe.createdBy.toString() !== req.user.id) {
      throw new ForbiddenError('Du får bara radera dina egna recept');
    }

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
    if (!req.user) {
      throw new UnauthorizedError('Autentisering krävs');
    }

    const { id } = req.validatedParams;
    const original = await Recipe.findById(id);

    if (!original) {
      throw new NotFoundError('Receptet hittades inte');
    }

    const forkedRecipe = await Recipe.create({
      title: original.title,
      createdBy: req.user.id,
      ingredients: original.ingredients,
      steps: original.steps,
      originalRef: original._id,
    });

    res.status(201).json(forkedRecipe);
  } catch (error) {
    next(error);
  }
};