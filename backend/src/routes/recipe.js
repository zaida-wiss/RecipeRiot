// Importerar Express-biblioteket så vi kan skapa routes.
const express = require('express');
// Skapar en ny router-instans som samlar alla routes för recept.
const router = express.Router();
// Importerar controllern som innehåller logiken för varje endpoint.
const recipesController = require('../controllers/recipesController');

// När någon gör GET /recipes anropas funktionen som hämtar alla recept.
router.get('/', recipesController.getAllRecipes);
// När någon gör GET /recipes/:id anropas funktionen som hämtar ett recept via id.
router.get('/:id', recipesController.getRecipeById);
// När någon gör POST /recipes anropas funktionen som skapar ett nytt recept.
router.post('/', recipesController.createRecipe);

// Exporterar routern så den kan användas i app.js med app.use(...).
module.exports = router;
