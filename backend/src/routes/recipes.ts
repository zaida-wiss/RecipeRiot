import { Router } from 'express';

import { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe } from '../controllers/recipesController';

import { validateRequest } from '../middleware/validate';

import { createRecipeSchema, updateRecipeSchema, recipeIdSchema } from '../schemas/recipeSchema';

const router = Router();

router.get('/', recipesController.getAllRecipes);
router.get('/:id', recipesController.getRecipeById);
router.post('/', recipesController.createRecipe);
router.patch('/:id', recipesController.updateRecipe);
router.delete('/:id', recipesController.deleteRecipe);
router.post('/:id/fork', recipesController.forkRecipe);

export default router;