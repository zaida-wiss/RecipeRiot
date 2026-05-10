// src/controllers/recipesController.ts
import { Request, Response } from 'express';
import { RecipeType } from '../types/recipeType';
import {Recipe} from "../models/recipeModel";


const recipes: RecipeType[] = [];


// Hämtar och returnerar alla recept.
export const getAllRecipes = async (_req: Request, res: Response) => {
  const recipes = await Recipe.find();
  return res.json(recipes);
};


// Hämtar ett recept baserat på id från URL-parametern.
export const getRecipeById = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const recipe = recipes.find((item) => item.id === id);

  if (!recipe) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  return res.json(recipe);
};


// Skapar ett nytt recept från data i request body.
export const createRecipe = (req: Request, res: Response) => {
  const { title, createdBy } = req.body;

  if (!title || !createdBy) {
    return res.status(400).json({ message: 'title och createdBy krävs' });
  }

  const newRecipe: RecipeType = {
    id: recipes.length + 1,
    title,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  recipes.push(newRecipe);
  return res.status(201).json(newRecipe);
};


//Uppdaterar hela recept-objektet
export const updateRecipeObject = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = recipes.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(400).json({message: "receptet hittades inte"
    });
  }

  const {title, createdBy, ingredients, steps } = req.body;

  if (!title || !createdBy || !Array.isArray(ingredients) || !Array.isArray(steps)) {
    return res.status(400).json({
      message: "title, createdBy, ingredients och steps krävs",
    });
  }

    const updatedRecipe: Recipe = {
      id,
      title,
      createdBy,
      ingredients,
      steps,
      createdAt: recipes[index].createdAt,
      updatedAt: new Date().toISOString(),
    };

    recipes[index] = updatedRecipe;

    return res.json(updatedRecipe);
};


//Uppdaterar recept fält
export const updateRecipeField = (req: Request, res: Response) => {
const id = Number(req.params.id);
const recipe = recipes.find((item) => item.id === id);

if(!recipe) {
  return res.status(404).json({message: "Receptet hittades inte"});
}

const { title, createdBy, ingredients, steps } = req.body;

if (
  title ===undefined &&
  createdBy === undefined &&
  ingredients === undefined &&
  steps === undefined
) {
  return res.status(400).json({message: "Skicka minst ett fält att uppdatera"});
}

if (title !== undefined) recipe.title = title;
if (createdBy !== undefined) recipe.createdBy = createdBy;
if (ingredients !== undefined) recipe.ingredients = ingredients;
if (steps !== undefined) recipe.steps = steps;

recipe.updatedAt = new Date().toISOString();

return res.json(recipe);
};


// Tar bort ett recept.
export const deleteRecipe = (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const index = recipes.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  recipes.splice(index, 1);
  return res.status(204).send();
};

// // Uppdaterar delar av ett recept.
// exports.updateRecipe = (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const { title, createdBy } = req.body;
//   const recipe = recipes.find((item) => item.id === id);

//   if (!recipe) {
//     return res.status(404).json({ message: 'Receptet hittades inte' });
//   }

//   if (title === undefined && createdBy === undefined) {
//     return res.status(400).json({ message: 'Skicka minst ett fält: title eller createdBy' });
//   }

//   if (title !== undefined) recipe.title = title;
//   if (createdBy !== undefined) recipe.createdBy = createdBy;

//   recipe.updatedAt = new Date().toISOString();
//   return res.json(recipe);
// };
