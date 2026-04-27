// src/controllers/recipesController.ts
import { Request, Response } from 'express';
import mongoose from "mongoose";
import { RecipeModel } from '../models/Recipe';

//Hjälpfunktion som håller samma id-fält i API-svaret
const toRecipeResponse = (doc: any) => ({
  id: doc._id.toString(),
  title: doc.title,
  createdBy: doc.createdBy,
  ingredients: doc.ingredients ?? [],
  steps: doc.steps ??[],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

exports.getAllRecipes = async (_req: Request, res: Response) => {
  const recipes = await RecipeModel.find().sort({ createdAt: -1});
  return res.json(recipes.map(toRecipeResponse));
};

exports.getRecipeById = async (req: Request, res: Response) => {
  const { id } = req.params;

  //Returnerar 400 om id-formatet inte är giltigt ObjectId
  if(!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Ogiltigt id-format' });
  }

  const recipe = await RecipeModel.findById(id);

  //Returnerar 404 om dokumentet inte finns
  if (!recipe) {
    return res.status(404).json({message: 'Recept hittades inte'});
  }

  return res.json(toRecipeResponse(recipe));
};

exports.createRecipe = async (req: Request, res: Response) => {
  const {title, createdBy, ingredients, steps} = req.body;

  //Enkel validering enligt ditt nuvarande API-upplägg
  if(!title || !createdBy) {
    return res.status(400).json({message: 'title och createdBy krävs'});
  }

  const createdRecipe = await RecipeModel.create({
    title,
    createdBy,
    ingredients: ingredients ?? [],
    steps: steps ?? [],
  });

  return res.status(201).json(toRecipeResponse(createdRecipe));
};

//Behåller endpointen men markerar att den ej ingår i vecka-4 minimum
exports.updateRecipe = async (_req: Request, res: Response) => {
  return res.status(501).json({message: 'Inte implementerad ännu'});
};

//Behåller endpointen men markerar att den ej ingår i vecka-4 minimum
exports.deleteRecipe = async (_req: Request, res: Response) => {
  return res.status(501).json({message: 'Inte implementerat ännu'});
};
