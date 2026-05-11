// src/controllers/recipesController.ts
import { Request, Response } from 'express';
import { Recipe } from '../models/Recipe';

// GET /api/v1/recipes
exports.getAllRecipes = async (_req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find();
    return res.json(recipes);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// GET /api/v1/recipes/:id
exports.getRecipeById = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Receptet hittades inte' });
    }
    return res.json(recipe);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// POST /api/v1/recipes
exports.createRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.create(req.body);
    return res.status(201).json(recipe);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// PATCH /api/v1/recipes/:id
exports.updateRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!recipe) {
      return res.status(404).json({ message: 'Receptet hittades inte' });
    }
    return res.json(recipe);
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// DELETE /api/v1/recipes/:id
exports.deleteRecipe = async (req: Request, res: Response) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Receptet hittades inte' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Något gick fel' });
  }
};

// POST /api/v1/recipes/:id/fork
exports.forkRecipe = async (req: Request, res: Response) => {
  try {
    const original = await Recipe.findById(req.params.id);

    if (!original) {
      return res.status(404).json({ message: 'Receptet hittades inte' });
    }

    const forkedRecipe = await Recipe.create({
      title: original.title,
      createdBy: req.body.createdBy,
      ingredients: original.ingredients,
      steps: original.steps,
      originalRef: original._id,
    });

    return res.status(201).json(forkedRecipe);
  } catch (error) {
    console.log('Fork fel:', error); // lägg till denna
    return res.status(500).json({ message: 'Något gick fel' });
  }
};