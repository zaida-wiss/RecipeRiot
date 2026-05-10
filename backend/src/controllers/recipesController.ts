// src/controllers/recipesController.ts
import { Request, Response, NextFunction } from "express";
import { Recipe } from "../models/recipeModel";
import { AppError } from "../middleware/errorHandler";

// Hämtar och returnerar alla recept.
const getAllRecipes = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const recipes = await Recipe.find();
    return res.json(recipes);
  } catch (error) {
    return next(error);
  }
};


// Hämtar ett recept baserat på id från URL-parametern.
const getRecipeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return next(new AppError("Receptet hittades inte.", 404));
    }

    return res.json(recipe);
  } catch (error) {
    return next(error);
  }
};

// Skapar ett nytt recept från data i request body.
const createRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, createdBy, ingredients, steps } = req.body;

    const newRecipe =  await Recipe.create({
      title,
      createdBy,
      ingredients,
      steps,
    });

    return res.status(201).json(newRecipe);
  } catch (error) {
    return next(error);
  }
};


// Uppdaterar hela recept-objektet.
const updateRecipeObject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return next(new AppError("Receptet hittades inte.", 404));
    }

    const { title, createdBy, ingredients, steps } = req.body;

    recipe.title = title;
    recipe.createdBy = createdBy;
    recipe.ingredients = ingredients;
    recipe.steps = steps;

    const updatedRecipe = await recipe.save();

    return res.json(updatedRecipe);
  } catch (error) {
    return next(error);
  }
};


// Uppdaterar ett eller flera recept-fält.
const updateRecipeField = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return next(new AppError("Receptet hittades inte.", 404));
    }

    const { title, createdBy, ingredients, steps } = req.body;

    if (title !== undefined) {
      recipe.title = title;
    }

    if (createdBy !== undefined) {
      recipe.createdBy = createdBy;
    }

    if (ingredients !== undefined) {
      recipe.ingredients = ingredients;
    }

    if (steps !== undefined) {
      recipe.steps = steps;
    }

    const updatedRecipe = await recipe.save();

    return res.json(updatedRecipe);
  } catch (error) {
    return next(error);
  }
};

// Tar bort ett recept.
const deleteRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return next(new AppError("Receptet hittades inte.", 404));
    }

    await recipe.deleteOne();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipeObject,
  updateRecipeField,
  deleteRecipe,
};
