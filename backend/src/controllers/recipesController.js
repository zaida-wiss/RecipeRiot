// En enkel in-memory lista med recept (försvinner när servern startas om).
const recipes = [
  { id: 1, title: 'Biff med Tomat', createdBy: 'Zaida' },
  { id: 2, title: 'Vietnamesiska vårrullar', createdBy: 'Zaida' },
];

// Hämtar och returnerar alla recept.
exports.getAllRecipes = (req, res) => {
  // Skickar hela arrayen som JSON-svar.
  res.json(recipes);
};

// Hämtar ett recept baserat på id från URL-parametern.
exports.getRecipeById = (req, res) => {
  // Konverterar id från text till nummer, t.ex. "1" -> 1.
  const id = Number(req.params.id);
  // Letar upp receptet vars id matchar parametern.
  const recipe = recipes.find((item) => item.id === id);

  // Om inget recept hittas returneras 404 Not Found.
  if (!recipe) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  // Om recept hittas returneras det som JSON.
  return res.json(recipe);
};

// Skapar ett nytt recept från data i request body.
exports.createRecipe = (req, res) => {
  // Plockar ut fälten title och createdBy från inkommande JSON.
  const { title, createdBy } = req.body;

  // Enkel validering: båda fälten måste finnas.
  if (!title || !createdBy) {
    return res.status(400).json({ message: 'title och createdBy krävs' });
  }

  // Bygger ett nytt receptobjekt med nästa lediga id.
  const newRecipe = {
    id: recipes.length + 1,
    title,
    createdBy,
  };

  // Lägger till det nya receptet i listan.
  recipes.push(newRecipe);
  // Returnerar 201 Created med det nyskapade receptet.
  return res.status(201).json(newRecipe);
};

