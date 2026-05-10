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

router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);
router.post("/", validateCreateRecipe, createRecipe);
router.put("/:id", validateUpdateRecipeObject, updateRecipeObject);
router.patch("/:id", validateUpdateRecipeField, updateRecipeField);
router.delete("/:id", deleteRecipe);

export default router;
