// src/routes/recipeRoutes.ts
import { Router } from 'express';
import * as recipeController from '../controllers/recipesController'
import { protect, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { createRecipeSchema, updateRecipeSchema } from '../schemas/recipe.schemas';

const router = Router();

// Öppna rutter
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);

// Skyddade rutter
router.post(
  '/', 
  protect, 
  authorize('kock', 'admin'), 
  validateRequest({ body: createRecipeSchema }), // 2. Använd createRecipeSchema här
  recipeController.createRecipe
);

router.put(
  '/:id', 
  protect, 
  authorize('kock', 'admin'), 
  validateRequest({ body: updateRecipeSchema }), // 3. Använd updateRecipeSchema här
  recipeController.updateRecipe
);

router.delete(
  '/:id', 
  protect, 
  authorize('kock', 'admin'), 
  recipeController.deleteRecipe
);

export default router;
