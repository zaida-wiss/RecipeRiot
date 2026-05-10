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

const router = Router();

router.get("/", getAllRecipes);
router.get("/:id", getRecipeById);
router.post("/", createRecipe);
router.put("/:id", updateRecipeObject);
router.patch("/:id", updateRecipeField);
router.delete("/:id", deleteRecipe);

export default router;
