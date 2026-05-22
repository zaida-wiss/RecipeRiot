// src/routes/recipes.ts
import { Router } from 'express';
import { validateRequest } from '../middleware/validate';
import {
  createRecipeSchema,
  updateRecipeSchema,
  listRecipesQuerySchema,
  idParamSchema,
} from '../schemas/recipe.schemas';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  forkRecipe,
} from '../controllers/recipesController';
import { authenticate } from '../middleware/auth';

const router = Router();

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/v1/recipes?page=&limit=&search=
router.get(
  '/',
  validateRequest({ query: listRecipesQuerySchema }),
  getAllRecipes
);

// GET /api/v1/recipes/:id
router.get(
  '/:id',
  validateRequest({ params: idParamSchema }),
  getRecipeById
);

// POST /api/v1/recipes
router.post(
  '/',
  authenticate,
  validateRequest({ body: createRecipeSchema }),
  createRecipe
);

// PATCH /api/v1/recipes/:id
router.patch(
  '/:id',
  authenticate,
  validateRequest({ params: idParamSchema, body: updateRecipeSchema }),
  updateRecipe
);

// DELETE /api/v1/recipes/:id
router.delete(
  '/:id',
  authenticate,
  validateRequest({ params: idParamSchema }),
  deleteRecipe
);

// POST /api/v1/recipes/:id/fork
router.post(
  '/:id/fork',
  authenticate,
  validateRequest({ params: idParamSchema }),
  forkRecipe
);

export default router;
