// En enkel in-memory lista med recept (försvinner när servern startas om).
const recipes = [
  { id: 1, title: 'Biff med Tomat', createdBy: 'Zaida', createdAt: '2026-04-02T10:00:00Z', updatedAt: '2026-04-02T10:00:00Z' },
  { id: 2, title: 'Vietnamesiska vårrullar', createdBy: 'Zaida', createdAt: '2026-04-02T10:00:00Z', updatedAt: '2026-04-02T10:00:00Z' },
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
    createdAt: new Date().toISOString(),  // Sätts nu
    updatedAt: new Date().toISOString()   // Samma som createdAt initialt
  };

  // Lägger till det nya receptet i listan.
  recipes.push(newRecipe);
  // Returnerar 201 Created med det nyskapade receptet.
  return res.status(201).json(newRecipe);
};

exports.deleteRecipe = (req, res) => {
  // Hämtar id från URL-parametern.
  const id = Number(req.params.id);

  // Hittar indexet på receptet i arrayen.
  const index = recipes.findIndex((item) => item.id === id);

  // Om receptet inte finns returneras 404.
  if (index === -1) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  // Tar bort receptet från arrayen.
  recipes.splice(index, 1);

  // Returnerar 204 No Content (framgång utan svardata).
  return res.status(204).send();
};

exports.updateRecipe = (req, res) => {
  // Hämtar id från URL-parametern.
  const id = Number(req.params.id);

  // Plockar ut möjliga värden från request body.
  const { title, createdBy } = req.body;

  // Hittar receptet.
  const recipe = recipes.find((item) => item.id === id);

  // Om receptet inte finns returneras 404.
  if (!recipe) {
    return res.status(404).json({ message: 'Receptet hittades inte' });
  }

  // Validering för PATCH: minst ett tillåtet fält måste skickas.
  if (title === undefined && createdBy === undefined) {
    return res.status(400).json({ message: 'Skicka minst ett fält: title eller createdBy' });
  }

  // Uppdaterar bara de fält som faktiskt skickas in.
  if (title !== undefined) {
    recipe.title = title;
  }

  if (createdBy !== undefined) {
    recipe.createdBy = createdBy;
  }

  // createdAt lämnas orörd, updatedAt ändras vid uppdatering.
  recipe.updatedAt = new Date().toISOString();

  // Returnerar det uppdaterade receptet.
  return res.json(recipe);
};
