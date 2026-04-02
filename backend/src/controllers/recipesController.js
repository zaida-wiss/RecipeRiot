const recipes = [
  { id: 1, title: 'Biff med Tomat', createdBy: 'Zaida' },
  { id: 2, title: 'Vietnamesiska vårrullar', createdBy: 'Zaida' },
];

exports.getAllRecipes = (req, res) => {
  res.json(recipes);
};

exports.getRecipeById = (req, res) => {
  const id = Number(req.params.id);
  const recipe = recipes.find((item) => item.id === id);

  if (!recipe) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  return res.json(recipe);
};

exports.createRecipe = (req, res) => {
  const { title, createdBy } = req.body;

  if (!title || !createdBy) {
    return res.status(400).json({ message: 'title och createdBy krävs' });
  }

  const newRecipe = {
    id: recipes.length + 1,
    title,
    createdBy,
  };

  recipes.push(newRecipe);
  return res.status(201).json(newRecipe);
};

