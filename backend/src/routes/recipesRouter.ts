// src/routes/recipesRouter.ts
import { Router } from "express";
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipeObject,
  updateRecipeField,
  deleteRecipe,
} from "../controllers/recipesController";
import {
  validateCreateRecipe,
  validateUpdateRecipeField,
  validateUpdateRecipeObject,
} from "../middleware/validateRecipe";
import { validateObjectIdParam } from "../middleware/validateParams";

const router = Router();

// GET-routes läser data och behöver därför ingen body-validering.
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// POST/PUT/PATCH validerar req.body innan recept-controllern körs.
router.post("/", validateObjectIdParam, validateCreateRecipe, createRecipe);
router.put("/:id", validateObjectIdParam, validateUpdateRecipeObject, updateRecipeObject);
router.patch("/:id", validateObjectIdParam, validateUpdateRecipeField, updateRecipeField);
router.delete("/:id", validateObjectIdParam, deleteRecipe);

export default router;
