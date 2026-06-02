# Implementera saknade delar från kursvecka 1-8

Den här filen är en arbetslista för RecipeRiot. Målet är att du ska kunna gå igenom projektet steg för steg och fylla i det som saknas eller behöver bli mer produktionsredo från kursvecka 1-8.

Bra start: mycket finns redan på plats. Du har backend med TypeScript/ESM, MongoDB, Zod-validering, auth med JWT, RBAC, health-route, tester och frontend som kan logga in och hämta recept. Det som återstår handlar mest om att göra lösningen mer konsekvent, säkrare och mer komplett.

## Snabb status

| Område | Status | Nästa steg |
| --- | --- | --- |
| Backend TypeScript + ESM | Finns | Behåll `.js` i relativa imports |
| MongoDB + modeller | Finns | Se över öppna user-routes |
| Zod-validering | Finns | Fortsätt validera alla nya body/query/params |
| Auth med bcrypt + JWT | Finns | Lägg till `role` i frontendtypen |
| RBAC admin/user | Finns delvis | Skydda fler routes som inte ska vara publika |
| Health route | Finns | Använd i deploy-check |
| Frontend auth | Finns | Låt frontend förstå användarens roll |
| ExplorePage hämtar backendrecept | Finns | Lägg till skapa/uppdatera/radera/forka |
| Frontend env | Finns delvis | Gör env-namnen konsekventa |
| Tester | Finns i backend | Lägg tester för nya skyddade regler |

## 1. Gör frontendens API-url konsekvent

Fråga till dig: varför är det riskabelt att auth använder ett env-namn och recipes ett annat?

Just nu använder frontend två olika namn:

```ts
// authApi.ts
import.meta.env.VITE_API_URL

// recipesApi.ts
import.meta.env.VITE_API_BASE_URL
```

Välj ett namn. Jag rekommenderar:

```txt
VITE_API_URL=http://127.0.0.1:3000
```

Skapa sedan en exempel-fil:

```txt
frontend/.env.example
```

Skriv:

```env
VITE_API_URL=http://127.0.0.1:3000
```

Ändra i `frontend/src/api/recipesApi.ts`:

```ts
const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000';
const API_BASE_URL = `${API_URL}/api/v1`;
```

Varför är det viktigt? Annars kan auth peka mot en backend och recipes mot en annan. Det blir svårt att felsöka eftersom login kan fungera samtidigt som receptsidan misslyckas.

Det finns en annan lika bra lösning: behåll `VITE_API_BASE_URL`, men då bör även `authApi.ts` använda samma bas. Det viktiga är konsekvens.

## 2. Låt backend använda `env` överallt

Fråga till dig: varför skapade du `backend/src/config/env.ts`?

Svaret är: för att backend ska validera sin konfiguration på ett ställe. Därför bör `app.ts` och `errorHandler.ts` använda `env`, inte `process.env` direkt.

I `backend/src/app.ts`, byt:

```ts
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
```

till:

```ts
import { env } from './config/env.js';

const allowedOrigin = env.CORS_ORIGIN;
```

I `backend/src/middleware/errorHandler.ts`, byt:

```ts
const isDevelopment = process.env.NODE_ENV === 'development';
```

till:

```ts
import { env } from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';
```

Varför är det viktigt? Annars kan en miljövariabel saknas eller vara fel utan att appen stoppar tydligt. `env.ts` är appens säkerhetskontroll för konfiguration.

## 3. Skydda eller ta bort öppna user-routes

Fråga till dig: ska vem som helst kunna lista, skapa, ändra och radera användare via `/api/v1/users`?

Just nu är `backend/src/routes/users.ts` öppen. Det är farligt i ett riktigt projekt.

Min rekommendation för kursvecka 1-8:

```txt
GET /api/v1/users        admin
GET /api/v1/users/:id    admin
POST /api/v1/users       admin eller tas bort
PUT /api/v1/users/:id    admin eller ägaren själv
DELETE /api/v1/users/:id admin
```

En enkel första lösning är att bara låta admin nå users-routes:

```ts
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';

router.get(
  '/',
  authenticate,
  authorizeRoles('admin'),
  validateRequest({ query: listUsersQuerySchema }),
  getAllUsers
);
```

Gör samma sak för `GET /:id`, `POST /`, `PUT /:id` och `DELETE /:id`.

Varför är det viktigt? Annars kan en vanlig besökare manipulera användardata utan att vara inloggad. Det bryter mot säkerhetstänket från auth/OWASP-veckan.

Alternativ lösning: ta bort `/api/v1/users` helt från `app.ts` tills du faktiskt behöver adminhantering av användare.

## 4. Lägg till `role` i frontendens auth-typ

Backend returnerar användarens roll, men frontendtypen saknar den just nu.

I `frontend/src/api/authApi.ts`, ändra:

```ts
export type AuthUser = {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};
```

till:

```ts
export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
};
```

Varför är det viktigt? Frontend ska inte bestämma säkerheten, men den kan använda rollen för att visa eller dölja admin-knappar. Backend måste fortfarande kontrollera rollen med `authorizeRoles`.

Alternativ lösning: om frontend inte behöver visa admin-UI ännu kan du vänta. Men typen bör ändå matcha backendens svar.

## 5. Lägg till skyddade recipe-anrop i frontend

Fråga till dig: just nu kan frontend hämta recept, men kan den skapa ett recept med token?

`frontend/src/api/recipesApi.ts` har `getAllRecipes`, men saknar funktioner för skyddade routes.

Lägg först till import:

```ts
import { getAuthHeaders } from './authApi';
```

Skapa en typ för recept som skickas till backend:

```ts
export type CreateRecipeInput = {
  title: string;
  ingredients?: ApiIngredient[];
  steps?: string[];
};
```

Lägg till:

```ts
export const createRecipe = async (
  recipe: CreateRecipeInput
): Promise<ApiRecipe> => {
  const response = await fetch(`${API_BASE_URL}/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    throw new Error('Kunde inte skapa recept');
  }

  return response.json() as Promise<ApiRecipe>;
};
```

Varför är det viktigt? Backendens `POST /recipes` kräver `Authorization: Bearer <token>`. Frontend ska aldrig skicka `createdBy`; backend hämtar användaren från tokenen.

Fler lika bra nästa funktioner:

```ts
updateRecipe(id, recipe)
deleteRecipe(id)
forkRecipe(id)
```

Börja med `createRecipe`, för den lär dig hela skyddade flödet.

## 6. Skapa ett formulär för att publicera recept

Fråga till dig: vilken data kräver backendens `createRecipeSchema`?

Minsta möjliga body är:

```json
{
  "title": "Pannkakor"
}
```

En bättre body är:

```json
{
  "title": "Pannkakor",
  "ingredients": [
    { "name": "Mjöl", "quantity": 2, "unit": "dl" }
  ],
  "steps": [
    "Blanda ingredienserna.",
    "Stek pannkakorna."
  ]
}
```

Skapa exempelvis:

```txt
frontend/src/components/createRecipe/CreateRecipeForm.tsx
frontend/src/components/createRecipe/CreateRecipeForm.css
```

En första enkel komponent kan bara ha titel och ett par textfält. Börja inte med perfekt dynamisk ingredienshantering direkt.

Varför är det viktigt? Du har redan backendstöd för publicering, men användaren kan inte göra det i UI:t ännu.

Alternativ lösning: använd Postman under utvecklingen och bygg UI senare. Det är okej när du testar backend, men appen blir inte komplett förrän frontend har formuläret.

## 7. Lägg till testdata/seed för recept

Fråga till dig: varför blir ExplorePage tom om databasen är tom?

Eftersom frontend nu hämtar från MongoDB, inte från mockdata.

Skapa ett seed-script senare:

```txt
backend/src/scripts/seedRecipes.ts
```

Idén:

```ts
await connectToDatabase();
const user = await User.findOne({ email: 'seed@example.com' });
await Recipe.insertMany(seedRecipes.map((recipe) => ({
  ...recipe,
  createdBy: user._id,
})));
```

Varför är det viktigt? Då kan du snabbt fylla databasen lokalt och i demo utan att klicka in recept ett i taget i Postman.

Alternativ lösning: fortsätt med Postman och posta ett recept i taget. Det är bra för att förstå API:t, men långsamt för många recept.

## 8. Lägg tester för det du skyddar

När du skyddar `/api/v1/users`, lägg tester som bevisar:

```txt
utan token -> 401
vanlig user -> 403
admin -> 200 eller rätt status
```

Exempel:

```ts
test('ska neka vanlig user från att lista användare', async () => {
  const token = await loginTestUser();

  const res = await request(app)
    .get('/api/v1/users')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(403);
});
```

Varför är det viktigt? Säkerhetskod utan tester kan lätt råka tas bort senare utan att någon märker det.

Alternativ lösning: manuellt testa med Postman. Det är bra som extra kontroll, men automatiska tester är bättre för regressionsskydd.

## 9. Gör deploy-checklistan konkret

Innan deploy ska du kunna köra:

```bash
cd backend
npm run build
npm test
```

Och:

```bash
cd frontend
npm run build
npm run lint
```

Kontrollera också:

```txt
backend/.env.example finns
frontend/.env.example finns
JWT_SECRET är minst 20 tecken
CORS_ORIGIN pekar på frontendens riktiga URL i produktion
VITE_API_URL pekar på backendens riktiga URL i produktion
/health svarar med status ok
```

Varför är det viktigt? Vecka 8 handlar mycket om att appen inte bara ska fungera lokalt, utan också vara möjlig att starta säkert i en annan miljö.

## Rekommenderad ordning

1. Gör frontendens env-namn konsekvent.
2. Lägg `role` i `AuthUser`.
3. Låt backend använda `env` i `app.ts` och `errorHandler.ts`.
4. Skydda eller ta bort öppna user-routes.
5. Lägg tester för user-route-skyddet.
6. Lägg `createRecipe` i frontendens `recipesApi.ts`.
7. Bygg ett enkelt `CreateRecipeForm`.
8. Skapa seed-script om du vill lägga in många recept snabbt.
9. Kör build, lint och tester.

## Kontrollfrågor

Svara gärna på de här medan du kodar:

1. Varför ska frontend inte skicka `createdBy`?
2. Varför måste `authenticate` ligga före `authorizeRoles`?
3. Varför räcker det inte att gömma admin-knappar i frontend?
4. Varför är `localStorage` okej i kursprojektet men inte alltid bäst i produktion?
5. Varför ska `.env.example` finnas men inte riktiga `.env`-hemligheter?

Du gör mycket rätt redan: projektet har en stabil auth-grund, validering och tester. Det du tränar på nu är nästa nivå: att se var säkerhetsbeslut faktiskt måste ligga, och att hålla frontend/backend-kontraktet konsekvent.
