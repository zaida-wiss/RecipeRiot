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

// List-routen behöver ingen body- eller params-validering.
router.get("/", getAllRecipes);
router.get("/:id", validateObjectIdParam, getRecipeById);

// POST har ingen :id i URL:en, så här valideras bara req.body.
router.post("/", validateCreateRecipe, createRecipe);

// PUT/PATCH/DELETE har :id och validerar därför params innan recept-controllern körs.
router.put("/:id", validateObjectIdParam, validateUpdateRecipeObject, updateRecipeObject);
router.patch("/:id", validateObjectIdParam, validateUpdateRecipeField, updateRecipeField);
router.delete("/:id", validateObjectIdParam, deleteRecipe);

export default router;
