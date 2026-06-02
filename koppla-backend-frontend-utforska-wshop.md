# Workshop - Koppla backendens recept till frontendens utforska-sida

## TypeScript, ESM, arrow functions och RecipeRiot

Den här workshoppen hjälper dig att koppla ihop:

```text
backend GET /api/v1/recipes
```

med:

```text
frontend /utforska
```

Målet är att alla recept som finns på servern också ska visas på utforska-sidan.

Du ska skriva koden själv, men du får kodexempel att skriva av. Läs frågorna innan varje steg. Om du kan svara ungefär rätt på dem är du redan på god väg.

Vi håller oss till projektets stil:

- TypeScript
- ESM
- `import` och `export`
- arrow functions
- React hooks
- `import type` när vi bara importerar typer
- tydlig separering mellan API-kod och UI-kod

## Målet

När du är klar ska frontend:

1. Hämta recept från backend.
2. Visa recepten på `/utforska`.
3. Hantera laddning.
4. Hantera fel.
5. Inte längre vara beroende av `mockRecipes` på utforska-sidan.
6. Kunna översätta backendens receptformat till frontendens kortformat.

## Innan du börjar

Svara för dig själv:

1. Varför ska frontend inte importera backendens Mongoose-modell direkt?
2. Varför är `fetch()` asynkront?
3. Varför behöver frontend veta vilken URL backend kör på?
4. Varför kan backendens recept se annorlunda ut än frontendens `Recipe`-typ?
5. Varför är det smart att lägga API-anrop i en egen fil?

Bra om du redan anar svaret: frontend pratar med backend via HTTP. Den läser inte backendens filer direkt.

## Så ser flödet ut

```text
Utforska-sidan laddas
        |
        v
useEffect körs
        |
        v
frontend anropar GET /api/v1/recipes
        |
        v
backend hämtar recept från MongoDB
        |
        v
frontend får JSON
        |
        v
frontend mappar backend-recept till UI-recept
        |
        v
recepten visas på sidan
```

Minnesregel:

```text
Backend äger datan. Frontend visar datan.
```

## Steg 1: Kontrollera backendens endpoint

Fil:

```text
backend/src/routes/recipes.ts
```

Du har redan en route:

```ts
router.get(
  '/',
  validateRequest({ query: listRecipesQuerySchema }),
  getAllRecipes
);
```

I `app.ts` monteras den så här:

```ts
app.use('/api/v1/recipes', recipesRouter);
```

Det betyder att endpointen blir:

```text
GET /api/v1/recipes
```

Om backend kör på port `3000` blir hela URL:en:

```text
http://localhost:3000/api/v1/recipes
```

Om backend kör på port `8080` blir den:

```text
http://localhost:8080/api/v1/recipes
```

Ledande fråga:

> Om `app.use('/api/v1/recipes', recipesRouter)` sätter prefixet och `router.get('/')` sätter slutet, vad blir hela endpointen?

Svar:

```text
/api/v1/recipes
```

Bra. Det här är exakt rätt sätt att tänka kring Express routes.

## Steg 2: Förstå backendens svar

Din controller returnerar inte bara en array. Den returnerar ett objekt:

```ts
res.json({
  data: recipes,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

Alltså får frontend ungefär detta:

```json
{
  "data": [
    {
      "_id": "665...",
      "title": "Pannkakor",
      "createdBy": "664...",
      "ingredients": [],
      "steps": [],
      "createdAt": "2026-05-25T10:00:00.000Z",
      "updatedAt": "2026-05-25T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

Viktigt:

```text
payload.data är recepten
payload.pagination är sidinformationen
```

Vad händer om du skriver fel och tror att hela svaret är en array?

```ts
const recipes: Recipe[] = await res.json();
```

Då försöker frontend använda ett objekt som om det vore en array. Det kan ge fel som:

```text
recipes.map is not a function
```

Minnesregel:

```text
Backendens JSON-form bestämmer hur frontend måste läsa svaret.
```

## Steg 3: Lägg backend-URL i frontendens env

Fil att skapa:

```text
frontend/.env.local
```

Skriv:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Om din backend kör på annan port, ändra porten:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Varför måste namnet börja med `VITE_`?

Vite skickar bara vidare env-variabler till frontend om de börjar med:

```text
VITE_
```

I frontend läser du värdet så här:

```ts
import.meta.env.VITE_API_BASE_URL
```

Ledande fråga:

> Varför vill vi inte hårdkoda backend-URL direkt i komponenten?

Bra svar:

```text
För att utveckling, test och produktion kan ha olika backend-URL.
```

## Steg 4: Skapa en API-fil för recept

Fil att skapa:

```text
frontend/src/api/recipesApi.ts
```

Varför en egen API-fil?

För att `ExplorePage.tsx` ska fokusera på UI:

```text
state, rendering, filter, modal
```

Och `recipesApi.ts` ska fokusera på HTTP:

```text
fetch, URL, response, errors
```

Skriv:

```ts
export type ApiIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

export type ApiRecipe = {
  _id: string;
  title: string;
  createdBy: string;
  ingredients: ApiIngredient[];
  steps: string[];
  originalRef?: string;
  createdAt: string;
  updatedAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type RecipesResponse = {
  data: ApiRecipe[];
  pagination: Pagination;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

const fetchRecipesPage = async (page: number): Promise<RecipesResponse> => {
  const response = await fetch(`${API_BASE_URL}/recipes?page=${page}&limit=100`);

  if (!response.ok) {
    throw new Error('Kunde inte hämta recept från servern');
  }

  return response.json() as Promise<RecipesResponse>;
};

export const getAllRecipes = async (): Promise<ApiRecipe[]> => {
  const allRecipes: ApiRecipe[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const response = await fetchRecipesPage(page);

    allRecipes.push(...response.data);
    totalPages = response.pagination.totalPages;
    page += 1;
  }

  return allRecipes;
};
```

Ledande fråga:

> Varför hämtar vi sida för sida istället för bara `limit=100` en gång?

Svar:

```text
För att backend max tillåter 100 recept per sida. Om det finns fler än 100 behöver frontend hämta nästa sida också.
```

Bra att du tränar på detta. Pagination är en central fullstack-grej.

## Steg 5: Förstå skillnaden mellan backend-recept och frontend-recept

Frontendens typ ser ungefär ut så här:

```ts
export interface Recipe {
  id: string;
  title: string;
  time: string;
  difficulty: 'Lätt' | 'Medel' | 'Svår';
  image: string;
  tags: string[];
  servings: number;
  rating: number;
  reviews: number;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
}
```

Men backendens recept har ungefär:

```ts
{
  _id: string;
  title: string;
  createdBy: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: string[];
  createdAt: string;
  updatedAt: string;
}
```

Ser du skillnaden?

Frontend vill ha:

```text
id, image, time, difficulty, tags, rating, reviews, description
```

Backend ger:

```text
_id, title, ingredients, steps, createdBy, createdAt, updatedAt
```

Därför behöver vi en adapter.

Minnesregel:

```text
Adapter = översättare mellan backend-format och frontend-format.
```

## Steg 6: Skapa en adapter

Du kan lägga adaptern i samma API-fil först. Senare kan du flytta den om filen blir stor.

Lägg till i:

```text
frontend/src/api/recipesApi.ts
```

Skriv:

```ts
import type { Recipe } from '../types';

const fallbackImages = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80',
];

const getFallbackImage = (index: number): string => {
  return fallbackImages[index % fallbackImages.length];
};

export const toUiRecipe = (recipe: ApiRecipe, index: number): Recipe => {
  return {
    id: recipe._id,
    title: recipe.title,
    time: '30 min',
    difficulty: 'Lätt',
    image: getFallbackImage(index),
    tags: ['Community'],
    servings: 4,
    rating: 0,
    reviews: 0,
    description:
      recipe.steps[0] ?? 'Ett recept från RecipeRiot-communityt.',
    ingredients: recipe.ingredients.map((ingredient) => ({
      name: ingredient.name,
      amount: `${ingredient.quantity} ${ingredient.unit}`,
    })),
    steps: recipe.steps,
  };
};
```

Varför sätter vi vissa värden själva?

För att backend just nu inte sparar:

```text
image, time, difficulty, tags, servings, rating, reviews, description
```

Det betyder att frontend måste välja rimliga standardvärden tills backend-modellen byggs ut.

Vad händer annars?

Om `RecipeCard` försöker läsa:

```ts
recipe.image
recipe.tags
recipe.rating
```

men de saknas, kan sidan visa trasiga bilder, tomma värden eller krascha.

## Steg 7: Använd API:t i ExplorePage

Fil:

```text
frontend/src/components/explorePage/ExplorePage.tsx
```

Just nu använder sidan:

```ts
import { recipes } from '../data/mockRecipes';
```

Den raden ska du senare ta bort från utforska-sidan, eftersom recepten ska komma från servern.

Börja med imports:

```ts
import { useEffect, useMemo, useState } from 'react';
import { Search, Clock, Tag } from 'lucide-react';
import RecipeModal from '../recipeModal/RecipeModal';
import type { Recipe } from '../../types';
import { getAllRecipes, toUiRecipe } from '../../api/recipesApi';
import './ExplorePage.css';
```

Observera:

```ts
import type { Recipe } from '../../types';
```

Varför `import type`?

För att `Recipe` bara används som TypeScript-typ. Den behövs inte som JavaScript när appen körs.

## Steg 8: Lägg till state för serverdata

I `ExplorePage` behöver du state för:

```text
recipes
loading
error
selectedRecipe
searchTerm
activeTag
activeDifficulty
```

Skriv ungefär så här:

```ts
const ExplorePage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState('Alla');
  const [activeDifficulty, setActiveDifficulty] = useState('Alla');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  // resten kommer i nästa steg
};
```

Ledande fråga:

> Varför börjar `recipes` som en tom array?

Svar:

```text
För att sidan kan renderas innan servern har svarat. Tom array är säkert att köra `.map()` och `.filter()` på.
```

Bra. Det är en viktig React-vana.

## Steg 9: Hämta recepten med useEffect

I samma komponent, lägg till:

```ts
useEffect(() => {
  const loadRecipes = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const apiRecipes = await getAllRecipes();
      const uiRecipes = apiRecipes.map((recipe, index) =>
        toUiRecipe(recipe, index)
      );

      setRecipes(uiRecipes);
    } catch (error) {
      console.error(error);
      setError('Kunde inte hämta recept från servern.');
    } finally {
      setLoading(false);
    }
  };

  void loadRecipes();
}, []);
```

Varför ligger `loadRecipes` inuti `useEffect`?

För att `useEffect` inte ska vara `async` direkt.

Skriv inte:

```ts
useEffect(async () => {
  // ...
}, []);
```

Varför inte?

React förväntar sig att funktionen i `useEffect` antingen returnerar:

```text
inget
```

eller:

```text
en cleanup-funktion
```

En `async` funktion returnerar alltid en `Promise`, och det är inte vad React vill ha där.

Minnesregel:

```text
useEffect är inte async. Funktionen inuti kan vara async.
```

Varför skriver vi:

```ts
void loadRecipes();
```

För att visa TypeScript och lintern:

```text
Jag vet att detta ger en Promise, men här startar jag bara arbetet.
```

## Steg 10: Räkna ut tags och filtrerade recept från serverdatan

Nu ska `allTags` använda `recipes` från state, inte mockdata.

```ts
const allTags = useMemo(() => {
  const tags = recipes.flatMap((recipe) => recipe.tags);
  return ['Alla', ...Array.from(new Set(tags))];
}, [recipes]);
```

Sedan:

```ts
const difficulties = ['Alla', 'Lätt', 'Medel', 'Svår'];

const filteredRecipes = recipes.filter((recipe) => {
  const matchesSearch = recipe.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesTag =
    activeTag === 'Alla' || recipe.tags.includes(activeTag);

  const matchesDifficulty =
    activeDifficulty === 'Alla' || recipe.difficulty === activeDifficulty;

  return matchesSearch && matchesTag && matchesDifficulty;
});
```

Ledande fråga:

> Varför har `useMemo` dependency `[recipes]`?

Svar:

```text
För att tag-listan ska räknas om när recepten från servern ändras.
```

Bra. Det är exakt det dependency-arrayen betyder.

## Steg 11: Visa loading och error

Innan du returnerar hela sidan kan du lägga:

```ts
if (loading) {
  return (
    <div className="explore-page-wrapper">
      <div className="explore-container">
        <p>Laddar recept...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="explore-page-wrapper">
      <div className="explore-container">
        <p>{error}</p>
      </div>
    </div>
  );
}
```

Varför är detta viktigt?

Utan loading-state kan användaren se en tom sida och tro att det inte finns några recept. Utan error-state blir det svårt att förstå om backend är avstängd, URL:en är fel eller CORS blockerar anropet.

## Steg 12: Behåll renderingen av korten

Din nuvarande JSX för korten kan i stort sett vara kvar:

```tsx
<div className="recipe-grid">
  {filteredRecipes.length > 0 ? (
    filteredRecipes.map((recipe) => (
      <article
        key={recipe.id}
        className="recipe-card"
        onClick={() => setSelectedRecipe(recipe)}
      >
        <div className="image-container">
          <img src={recipe.image} alt={recipe.title} className="recipe-image" />
        </div>

        <div className="recipe-content">
          <div className="recipe-meta">
            <span className="difficulty-badge">{recipe.difficulty}</span>
            <span className="time-info">
              <Clock size={14} /> {recipe.time}
            </span>
          </div>

          <h2 className="recipe-title">{recipe.title}</h2>

          <div className="recipe-tags">
            {recipe.tags.map((tag) => (
              <span key={tag} className="tag">
                <Tag size={10} style={{ marginRight: '4px' }} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    ))
  ) : (
    <div className="no-results">
      <p>Inga recept matchar din sökning. Prova något annat!</p>
    </div>
  )}
</div>
```

Det viktiga är att:

```ts
filteredRecipes
```

nu kommer från serverdata, inte från `mockRecipes`.

## Steg 13: Testa kopplingen

Starta backend:

```bash
cd backend
npm run dev
```

Starta frontend i en annan terminal:

```bash
cd frontend
npm run dev
```

Öppna:

```text
http://localhost:5173/utforska
```

Kontrollera i webbläsarens DevTools:

1. Gå till fliken Network.
2. Ladda om sidan.
3. Leta efter request till `/api/v1/recipes`.
4. Kontrollera att status är `200`.
5. Klicka på requesten och titta på JSON-svaret.

Ledande fråga:

> Om Network visar 404, vad kontrollerar du först?

Svar:

```text
Att URL:en är rätt: /api/v1/recipes, inte /api/recipes.
```

Ledande fråga:

> Om Network visar CORS-fel, vad kontrollerar du?

Svar:

```text
Att backendens CORS_ORIGIN matchar frontendens URL, till exempel http://localhost:5173.
```

## Steg 14: Om sidan är tom

Om requesten fungerar men sidan är tom, kontrollera:

1. Finns det recept i databasen?
2. Returnerar backend `data: []`?
3. Är `apiRecipes.map(...)` korrekt?
4. Har varje recept `_id`?
5. Krockar filtret med `activeTag` eller `activeDifficulty`?

För att felsöka kan du tillfälligt skriva:

```ts
console.log(apiRecipes);
console.log(uiRecipes);
```

Ta bort loggarna när du förstått problemet.

## Steg 15: Skapa testdata om databasen är tom

Eftersom `POST /api/v1/recipes` kräver token behöver du först:

1. Registrera eller logga in.
2. Kopiera token.
3. Skapa recept med `Authorization: Bearer <token>`.

Exempel i Thunder Client eller Postman:

```text
POST http://localhost:3000/api/v1/auth/register
```

Body:

```json
{
  "username": "ReceptTestare",
  "email": "recepttestare@example.com",
  "password": "superhemligt123"
}
```

Kopiera `token` från svaret.

Skapa recept:

```text
POST http://localhost:3000/api/v1/recipes
```

Headers:

```text
Authorization: Bearer <din-token>
Content-Type: application/json
```

Body:

```json
{
  "title": "Pannkakor",
  "ingredients": [
    {
      "name": "Mjöl",
      "quantity": 2,
      "unit": "dl"
    },
    {
      "name": "Mjölk",
      "quantity": 5,
      "unit": "dl"
    }
  ],
  "steps": [
    "Blanda ingredienserna.",
    "Stek pannkakorna."
  ]
}
```

Sedan ska receptet synas via:

```text
GET http://localhost:3000/api/v1/recipes
```

Och därefter på:

```text
http://localhost:5173/utforska
```

## Steg 16: Vanliga fel

### Fel URL

Fel:

```ts
const API_URL = 'http://localhost:8080/api/recipes';
```

Rätt om backend använder `api/v1`:

```ts
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

Endpoint:

```ts
`${API_BASE_URL}/recipes`
```

### Du glömmer `data`

Fel:

```ts
const recipes = await response.json();
setRecipes(recipes);
```

Rätt:

```ts
const payload = await response.json();
setRecipes(payload.data);
```

Eller i vår lösning:

```ts
const apiRecipes = await getAllRecipes();
```

### Backend är inte startad

Symptom:

```text
Failed to fetch
```

Kontrollera att backend-terminalen kör:

```bash
npm run dev
```

### CORS blockerar

Symptom i browser console:

```text
Access to fetch at ... has been blocked by CORS policy
```

Kontrollera backendens `.env`:

```env
CORS_ORIGIN=http://localhost:5173
```

### Frontend env ändras men inget händer

Om du ändrar:

```env
VITE_API_BASE_URL=...
```

måste du starta om Vite:

```bash
npm run dev
```

Vite läser env vid start.

## Steg 17: En bättre lösning senare

Just nu använder vi standardvärden i adaptern:

```ts
time: '30 min',
difficulty: 'Lätt',
tags: ['Community'],
rating: 0,
reviews: 0,
```

Det fungerar för kopplingen, men senare kan du bygga ut backendens `Recipe`-modell med fler fält:

```ts
description
image
time
difficulty
tags
servings
```

Då slipper frontend gissa.

Det finns alltså två bra lösningar:

1. **Adapter i frontend nu**  
   Bra när backend inte har alla UI-fält ännu.

2. **Bygga ut backendens receptmodell**  
   Bra när recepten faktiskt ska lagra bild, tid, svårighetsgrad och taggar i databasen.

För den här workshoppen är adapter-lösningen bäst, eftersom målet är att koppla ihop befintlig backend med befintlig utforska-sida utan att bygga om hela receptmodellen.

## Steg 18: Kontrollfrågor

Svara utan att titta:

1. Vilken endpoint hämtar frontend recepten från?
2. Varför heter env-variabeln `VITE_API_BASE_URL`?
3. Varför behöver vi `ApiRecipe` och `Recipe` som två olika typer?
4. Varför använder vi `useEffect` för att hämta recept?
5. Varför skriver vi `void loadRecipes()`?
6. Varför behöver vi `payload.data`?
7. Vad gör adaptern `toUiRecipe`?
8. Vad betyder det om Network visar status `200` men sidan ändå är tom?

Om du kan svara på de frågorna har du förstått själva kopplingen, inte bara skrivit av koden. Det är målet.

## Sammanfattning

Du har kopplat:

```text
MongoDB -> Express controller -> /api/v1/recipes -> fetch -> React state -> Utforska-sidan
```

Det är fullstack-flödet.

Det viktigaste du ska öva mer på:

- läsa backendens JSON-svar
- skapa TypeScript-typer för API-data
- skilja på backend-format och frontend-format
- använda `useEffect` med async arrow function inuti
- hantera loading och error
- felsöka i Network-tabben

Bra jobbat om du kommer hit. Det här är en av de viktigaste kopplingarna i ett fullstackprojekt: att låta frontend visa riktig data från backend.
