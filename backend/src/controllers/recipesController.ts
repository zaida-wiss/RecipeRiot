// src/controllers/recipesController.ts
import { Request, Response, NextFunction } from 'express';
import { Recipe } from '../models/Recipe';
import { NotFoundError } from '../errors/AppError';

// GET /api/v1/recipes
export const getAllRecipes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

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
      createdBy: req.body.createdBy,
      ingredients: original.ingredients,
      steps: original.steps,
      originalRef: original._id,
    });

    res.status(201).json(forkedRecipe);
  } catch (error) {
    next(error);
  }
};