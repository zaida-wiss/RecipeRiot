// src/routes/recipes.ts
import { Router } from 'express';
import { validateRequest } from '../middleware/validate';
import {
  createRecipeSchema,
  updateRecipeSchema,
  listRecipesQuerySchema,
  idParamSchema,
} from '../schemas/recipe.schemas';

const recipesController = require('../controllers/recipesController');

const router = Router();

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/recipes?page=&limit=&search=
router.get(
  '/',
  validateRequest({ query: listRecipesQuerySchema }),
  recipesController.getAllRecipes
);

// GET /api/recipes/:id
router.get(
  '/:id',
  validateRequest({ params: idParamSchema }),
  recipesController.getRecipeById
);

// POST /api/recipes
router.post(
  '/',
  validateRequest({ body: createRecipeSchema }),
  recipesController.createRecipe
);

// PATCH /api/recipes/:id
router.patch(
  '/:id',
  validateRequest({ params: idParamSchema, body: updateRecipeSchema }),
  recipesController.updateRecipe
);

// DELETE /api/recipes/:id
router.delete(
  '/:id',
  validateRequest({ params: idParamSchema }),
  recipesController.deleteRecipe
);

// POST /api/recipes/:id/fork
router.post(
  '/:id/fork',
  validateRequest({ params: idParamSchema }),
  recipesController.forkRecipe
);

module.exports = router;