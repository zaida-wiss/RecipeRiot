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

const router = Router();

// GET-routes läser data och behöver därför ingen body-validering.
router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);

// POST/PUT/PATCH validerar req.body innan recept-controllern körs.
router.post("/", validateCreateRecipe, createRecipe);
router.put("/:id", validateUpdateRecipeObject, updateRecipeObject);
router.patch("/:id", validateUpdateRecipeField, updateRecipeField);
router.delete("/:id", deleteRecipe);

export default router;
