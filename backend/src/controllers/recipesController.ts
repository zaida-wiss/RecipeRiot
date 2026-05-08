// src/controllers/recipesController.ts
import { Request, Response } from 'express';
import { Recipe } from '../types/recipesTypes';

// En enkel in-memory lista med recept (försvinner när servern startas om).
const recipes: Recipe[] = [
  { id: 1, title: 'Biff med Tomat', createdBy: 'Zaida', ingredients: [], steps: [], createdAt: '2026-04-02T10:00:00Z', updatedAt: '2026-04-02T10:00:00Z' },
  { id: 2, title: 'Vietnamesiska vårrullar', createdBy: 'Zaida', ingredients: [], steps: [], createdAt: '2026-04-02T10:00:00Z', updatedAt: '2026-04-02T10:00:00Z' },
];

// Hämtar och returnerar alla recept.
exports.getAllRecipes = (_req: Request, res: Response) => {
  res.json(recipes);
};

// Hämtar ett recept baserat på id från URL-parametern.
exports.getRecipeById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const recipe = recipes.find((item) => item.id === id);

  if (!recipe) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  return res.json(recipe);
};

// Skapar ett nytt recept från data i request body.
exports.createRecipe = (req: Request, res: Response) => {
  const { title, createdBy } = req.body;

  if (!title || !createdBy) {
    return res.status(400).json({ message: 'title och createdBy krävs' });
  }

  const newRecipe: Recipe = {
    id: recipes.length + 1,
    title,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  recipes.push(newRecipe);
  return res.status(201).json(newRecipe);
};

// Tar bort ett recept.
exports.deleteRecipe = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = recipes.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  recipes.splice(index, 1);
  return res.status(204).send();
};

// Uppdaterar delar av ett recept.
exports.updateRecipe = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { title, createdBy } = req.body;
  const recipe = recipes.find((item) => item.id === id);

  if (!recipe) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  if (title === undefined && createdBy === undefined) {
    return res.status(400).json({ message: 'Skicka minst ett fält: title eller createdBy' });
  }

  if (title !== undefined) recipe.title = title;
  if (createdBy !== undefined) recipe.createdBy = createdBy;

  recipe.updatedAt = new Date().toISOString();
  return res.json(recipe);
};
