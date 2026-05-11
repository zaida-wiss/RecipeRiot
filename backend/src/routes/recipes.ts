import { Router } from 'express';

import { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } from '../controllers/recipesController';

import { validateRequest } from '../middleware/validate';

import { createRecipeSchema, updateRecipeSchema, recipeIdSchema } from '../schemas/recipeSchema';

const router = Router();

router.get('/', getAllRecipes);

router.get(
  '/:id',
  validateRequest({ params: recipeIdSchema }),
  getRecipeById
);

router.post(
  '/',
  validateRequest({ body: createRecipeSchema }),
  createRecipe
);

router.patch(
  '/:id',
  validateRequest({
    params: recipeIdSchema,
    body: updateRecipeSchema,
  }),
  updateRecipe
);

router.delete(
  '/:id',
  validateRequest({ params: recipeIdSchema }),
  deleteRecipe
);

export default router;