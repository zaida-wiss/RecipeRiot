// src/controllers/recipesController.js
// Logiken för recipe-endpoints
// Enkel lista ersätter databasen tills vidare - samma mönster som studiematerialet

const recipes = [
  { id: 1, title: 'Köttbullar', description: 'Klassiska svenska köttbullar', authorId: 1, difficulty: 'easy' },
  { id: 2, title: 'Pasta Carbonara', description: 'Krämig italiensk pasta', authorId: 2, difficulty: 'medium' },
];

// GET /api/v1/recipes
const getAllRecipes = (req, res) => {
  res.json(recipes);
};

// GET /api/v1/recipes/:id
const getRecipeById = (req, res) => {
  const id = parseInt(req.params.id);
  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  res.json(recipe);
};

// POST /api/v1/recipes
const createRecipe = (req, res) => {
  const { title, authorId } = req.body;

  if (!title || !authorId) {
    return res.status(400).json({ message: 'title och authorId krävs' });
  }

  const newRecipe = {
    id: recipes.length + 1,
    title,
    description: req.body.description || '',
    authorId,
    difficulty: req.body.difficulty || 'easy',
  };

  recipes.push(newRecipe);
  res.status(201).json(newRecipe);
};

// PUT /api/v1/recipes/:id
const updateRecipe = (req, res) => {
  const id = parseInt(req.params.id);
  const index = recipes.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  recipes[index] = { id, ...req.body };
  res.json(recipes[index]);
};

// DELETE /api/v1/recipes/:id
const deleteRecipe = (req, res) => {
  const id = parseInt(req.params.id);
  const index = recipes.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  recipes.splice(index, 1);
  res.status(204).send();
};

module.exports = { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };
