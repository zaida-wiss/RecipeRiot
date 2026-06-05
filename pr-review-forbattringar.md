# PR-review: förbättringar att göra steg för steg

Den här filen visar vilka delar från PR:en som kan förbättras innan ni mergar. Tanken är att du ska kunna gå till rätt fil, hitta den befintliga koden och byta ut den mot ett bättre alternativ.

Jag utgår från de ändringar som låg i PR-texten: favoriter, soft delete på recept, profilsida och `createdByUsername`.

## 1. Validera `recipeId` i favorites-routes

### Problemet

I PR:en finns ungefär detta i `backend/src/routes/favorites.ts`:

```ts
router.post('/:recipeId', addFavorite);
router.delete('/:recipeId', removeFavorite);
```

Det betyder att `recipeId` går direkt från URL:en till controllern utan Zod-validering.

Om någon skickar:

```txt
/api/v1/favorites/abc
```

kan Mongoose få ett ogiltigt id och ge ett otydligare fel senare.

### Lägg till schema

Skapa eller komplettera filen:

```txt
backend/src/schemas/favorite.schemas.ts
```

med:

```ts
import { z } from 'zod';

export const favoriteRecipeParamSchema = z.object({
  recipeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Ogiltigt MongoDB ObjectId-format'),
});
```

### Byt ut routes-koden

Byt från:

```ts
router.post('/:recipeId', addFavorite);
router.delete('/:recipeId', removeFavorite);
```

till:

```ts
router.post(
  '/:recipeId',
  validateRequest({ params: favoriteRecipeParamSchema }),
  addFavorite
);

router.delete(
  '/:recipeId',
  validateRequest({ params: favoriteRecipeParamSchema }),
  removeFavorite
);
```

Kom ihåg importerna längst upp:

```ts
import { validateRequest } from '../middleware/validate.js';
import { favoriteRecipeParamSchema } from '../schemas/favorite.schemas.js';
```

### Byt i controllern

I `backend/src/controllers/favoritesController.ts`, byt från:

```ts
const { recipeId } = req.params;
```

till:

```ts
const { recipeId } = req.validatedParams;
```

Det här är bättre eftersom controllern då använder data som redan är kontrollerad av Zod.

## 2. Dölj soft-deletade favoritrecept

### Problemet

I PR:en finns ungefär:

```ts
const user = await User.findById(req.user.id).populate('favorites');
```

Om ett favoritrecept är soft-deletat, alltså har:

```ts
deletedAt: new Date()
```

kan det fortfarande dyka upp i `populate('favorites')`, eftersom dokumentet finns kvar i databasen.

### Byt ut koden

Byt från:

```ts
const user = await User.findById(req.user.id).populate('favorites');
```

till:

```ts
const user = await User.findById(req.user.id).populate({
  path: 'favorites',
  match: { deletedAt: null },
});
```

Om TypeScript klagar på typen kan du hålla svaret enkelt:

```ts
res.json({ data: user.favorites });
```

### Varför?

Soft delete betyder att dokumentet finns kvar men ska behandlas som borttaget. Då behöver alla listningar filtrera bort det.

## 3. Hämta mina recept från backend i stället för att filtrera i frontend

### Problemet

I PR:ens `ProfilePage` finns ungefär:

```ts
const all = await getAllRecipes();
setMyRecipes(all.filter((r) => r.createdBy === user?.id));
```

Det fungerar i början, men blir ineffektivt när databasen växer. Frontend ska inte behöva hämta alla recept bara för att visa användarens egna.

### Lägg till controller

I `backend/src/controllers/recipesController.ts`, lägg till:

```ts
export const getMyRecipes = asyncHandler(async (req, res): Promise<void> => {
  const userId = getAuthenticatedUserId(req);

  const recipes = await Recipe.find({
    createdBy: userId,
    deletedAt: null,
  }).sort({ createdAt: -1 });

  res.json({ data: recipes });
});
```

Om ni inte har `deletedAt` på `Recipe` ännu, använd tillfälligt:

```ts
const recipes = await Recipe.find({
  createdBy: userId,
}).sort({ createdAt: -1 });
```

### Lägg till route

I `backend/src/routes/recipes.ts`, importera:

```ts
getMyRecipes,
```

Lägg sedan routen före `/:id`:

```ts
router.get(
  '/me',
  authenticate,
  getMyRecipes
);
```

Det är viktigt att `/me` ligger före:

```ts
router.get('/:id', ...)
```

Annars tror Express att ordet `me` är ett id.

### Lägg till frontend API-funktion

I `frontend/src/api/recipesApi.ts`, lägg till:

```ts
export const getMyRecipes = async (): Promise<Recipe[]> => {
  const response = await fetch(`${API_URL}/recipes/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Kunde inte hämta dina recept');
  }

  const json = await response.json();
  return json.data ?? [];
};
```

### Byt i ProfilePage

Byt från:

```ts
const all = await getAllRecipes();
setMyRecipes(all.filter((r) => r.createdBy === user?.id));
```

till:

```ts
const mine = await getMyRecipes();
setMyRecipes(mine);
```

Och i `Promise.all`, byt från:

```ts
const [allRecipes, favs] = await Promise.all([
  getAllRecipes(),
  getFavorites(),
]);

setMyRecipes(allRecipes.filter((r) => r.createdBy === user?.id));
setFavorites(favs);
```

till:

```ts
const [mine, favs] = await Promise.all([
  getMyRecipes(),
  getFavorites(),
]);

setMyRecipes(mine);
setFavorites(favs);
```

## 4. Bestäm vad `createdByUsername` betyder

### Problemet

I PR:en skapas recept ungefär så här:

```ts
const recipe = await Recipe.create({
  ...req.validatedBody,
  createdBy: userId,
  createdByUsername: req.user?.username ?? 'Okänd',
});
```

Det gör att användarnamnet sparas som en kopia på receptet.

Om användaren senare byter username kan receptet fortfarande visa det gamla namnet.

### Alternativ A: behåll som snapshot

Det här är enklast och helt okej om ni vill att receptet ska visa namnet användaren hade när receptet skapades.

Då bör ni lägga en kommentar i `backend/src/models/Recipe.ts`:

```ts
// Snapshot av användarnamnet när receptet skapades.
// Om användaren byter username uppdateras inte gamla recept automatiskt.
createdByUsername: { type: String, default: 'Okänd' },
```

### Alternativ B: visa alltid aktuellt username

Det här är mer korrekt men större ändring. Då bör `createdBy` vara en riktig relation:

```ts
createdBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
}
```

Sedan hämtar ni recept med:

```ts
Recipe.find(filter).populate('createdBy', 'username')
```

Det kräver fler ändringar i typer, tester och frontend. Jag skulle vänta med detta om ni vill hålla PR:en liten.

## 5. Lägg tillbaka pedagogiska kommentarer

### Problemet

Kommentarerna är en del av ert lärandematerial. Om en PR råkar ta bort dem blir koden svårare att redovisa och repetera.

### Förslag på review-kommentar

Skriv ungefär:

```txt
Kan du lägga tillbaka de pedagogiska kommentarerna i de här filerna?
De hjälper oss inför redovisningen och är en del av hur vi lär oss projektet.
```

### Teamregel

En bra regel:

```txt
Ta bara bort pedagogiska kommentarer om teamet uttryckligen är överens om det.
```

## Rekommenderad ordning

Gör ändringarna i den här ordningen:

1. Validera `recipeId` med Zod.
2. Filtrera bort soft-deletade favoriter.
3. Lägg till `/api/v1/recipes/me`.
4. Bestäm om `createdByUsername` är snapshot eller relation.
5. Återställ kommentarer.

Det viktigaste att förstå är mönstret:

```txt
Validera indata tidigt.
Filtrera bort soft-deletad data konsekvent.
Låt backend göra databasurval.
Dokumentera medvetna kompromisser.
```

