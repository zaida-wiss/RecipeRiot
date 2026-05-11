import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';
import { Recipe } from '../types';

const recipes: Recipe[] = [];

export const getAllRecipes = (_req: Request, res: Response) => {
  res.json(recipes);
};

export const getRecipeById = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const recipe = recipes.find(r => r.id === id);

    if (!recipe) throw new NotFoundError('Receptet hittades inte');

    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

export const createRecipe = (req: Request, res: Response, next: NextFunction) => {
  try {
    const newRecipe = {
      id: recipes.length + 1,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    recipes.push(newRecipe);

    res.status(201).json(newRecipe);
  } catch (err) {
    next(err);
  }
};

export const updateRecipe = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const recipe = recipes.find(r => r.id === id);

    if (!recipe) throw new NotFoundError('Receptet hittades inte');

    Object.assign(recipe, req.body);
    recipe.updatedAt = new Date().toISOString();

    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

export const deleteRecipe = (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const index = recipes.findIndex(r => r.id === id);

    if (index === -1) throw new NotFoundError('Receptet hittades inte');

    recipes.splice(index, 1);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};