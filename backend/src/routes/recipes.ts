// src/routes/recipes.ts
import { Router } from 'express';
const recipesController = require('../controllers/recipesController');

const router = Router();

router.get('/', recipesController.getAllRecipes);
router.get('/:id', recipesController.getRecipeById);
router.post('/', recipesController.createRecipe);
router.patch('/:id', recipesController.updateRecipe);
router.delete('/:id', recipesController.deleteRecipe);
router.post('/:id/fork', recipesController.forkRecipe);

module.exports = router;
