// src/controllers/recipesController.ts
import { Request, Response, NextFunction } from 'express';
import { Recipe } from "../models/recipeModel";

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
      return res.status(404).json({
        error: {
          message: "Receptet hittades inte",
          status: 404,
        },
       });
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

    if (!title || !createdBy) {
      return res.status(400).json({
        error: {
          message: "titel och skapare krävs",
          status: 400,
        },
      });
    }

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


// //Uppdaterar hela recept-objektet
// const updateRecipeObject = (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const index = recipes.findIndex((item) => item.id === id);

//   if (index === -1) {
//     return res.status(400).json({message: "receptet hittades inte"
//     });
//   }

//   const {title, createdBy, ingredients, steps } = req.body;

//   if (!title || !createdBy || !Array.isArray(ingredients) || !Array.isArray(steps)) {
//     return res.status(400).json({
//       message: "title, createdBy, ingredients och steps krävs",
//     });
//   }

//     const updatedRecipe: Recipe = {
//       id,
//       title,
//       createdBy,
//       ingredients,
//       steps,
//       createdAt: recipes[index].createdAt,
//       updatedAt: new Date().toISOString(),
//     };

//     recipes[index] = updatedRecipe;

//     return res.json(updatedRecipe);
// };


// //Uppdaterar recept fält
// const updateRecipeField = (req: Request, res: Response) => {
// const id = Number(req.params.id);
// const recipe = recipes.find((item) => item.id === id);

// if(!recipe) {
//   return res.status(404).json({message: "Receptet hittades inte"});
// }

// const { title, createdBy, ingredients, steps } = req.body;

// if (
//   title ===undefined &&
//   createdBy === undefined &&
//   ingredients === undefined &&
//   steps === undefined
// ) {
//   return res.status(400).json({message: "Skicka minst ett fält att uppdatera"});
// }

// if (title !== undefined) recipe.title = title;
// if (createdBy !== undefined) recipe.createdBy = createdBy;
// if (ingredients !== undefined) recipe.ingredients = ingredients;
// if (steps !== undefined) recipe.steps = steps;

// recipe.updatedAt = new Date().toISOString();

// return res.json(recipe);
// };


// // Tar bort ett recept.
// const deleteRecipe = (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const index = recipes.findIndex((item) => item.id === id);

//   if (index === -1) {
//     return res.status(404).json({ message: 'Receptet hittades inte' });
//   }

//   recipes.splice(index, 1);
//   return res.status(204).send();
// };


export {
   getAllRecipes,
   getRecipeById,
   createRecipe,
//   updateRecipeObject,
//   updateRecipeField,
//   deleteRecipe
 };


 
// // // Uppdaterar delar av ett recept.
// // exports.updateRecipe = (req: Request, res: Response) => {
// //   const id = Number(req.params.id);
// //   const { title, createdBy } = req.body;
// //   const recipe = recipes.find((item) => item.id === id);

// //   if (!recipe) {
// //     return res.status(404).json({ message: 'Receptet hittades inte' });
// //   }

// //   if (title === undefined && createdBy === undefined) {
// //     return res.status(400).json({ message: 'Skicka minst ett fält: title eller createdBy' });
// //   }

// //   if (title !== undefined) recipe.title = title;
// //   if (createdBy !== undefined) recipe.createdBy = createdBy;

// //   recipe.updatedAt = new Date().toISOString();
// //   return res.json(recipe);
// // };
