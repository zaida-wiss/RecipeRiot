# Workshop: Koppla ihop backend vecka 1-7 med frontend

Målet med den här workshopen är att du själv ska koppla ihop RecipeRiots frontend med den backend som redan finns i branchen `userLogin0`/`dev2`.

Du ska framför allt byta bort frontendens demo-inloggning mot backendens riktiga auth-flöde:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Workshopen följer kursvecka 1-7 i studiematerialet:

Underlag i projektet:

- `kursvecka1-intro-nodejs-express.md`
- `kursvecka2-restapi-routing-middleware.md`
- `kursvecka3-typescript-backend.md`
- `kursvecka4-mongodb-mongoose-grunder.md`
- `kursvecka5-crud-relationer-testning.md`
- `kursvecka6-backend-validering-och-felhantering.md`
- `kursvecka7-autentisering-owasp-jwt-workshop.md`

PDF:en du pekade ut hör till samma kursområde: Node.js, databaser och säkerhet. I den här workshopen kopplar jag därför varje praktiskt steg till de säkerhetsprinciper som återkommer i materialet: struktur, validering, databasansvar, auth och OWASP-tänk.

| Kursvecka | Koppling i den här workshopen |
|---|---|
| Vecka 1: Node, Express, HTTP | Frontend skickar HTTP-anrop till backend och får JSON tillbaka. |
| Vecka 2: REST, routes, middleware | Frontend använder rätt routes: `/api/v1/auth/...` och `/api/v1/recipes`. |
| Vecka 3: TypeScript | Vi skapar tydliga typer för `AuthUser` och `AuthResponse` i frontend. |
| Vecka 4: MongoDB/Mongoose | Backend sparar användare och recept i databasen, inte i frontend state. |
| Vecka 5: CRUD, relationer, testning | Recept skapas med `createdBy` från inloggad användare. |
| Vecka 6: Validering och felhantering | Backendens Zod-validering får sista ordet. Frontendvalidering är bara användarhjälp. |
| Vecka 7: Auth, bcrypt, JWT, OWASP | Frontend skickar lösenord till auth-routes, får JWT och skickar `Authorization: Bearer ...` vid skyddade anrop. |

Bra att du redan har kommit hit: backend har redan mycket av det viktiga från studiematerialet på plats. Du har `routes`, `controllers`, `validateRequest`, `errorHandler`, `bcrypt`, `JWT` och `authenticate`. Nu ska frontend sluta låtsaslogga in.

## Startläge

Innan du ändrar något, kontrollera att du står på rätt branch:

```bash
git status --short --branch
```

Du vill se något i stil med:

```text
## userLogin0...origin/userLogin0
```

Starta sedan backend och frontend i två terminaler:

```bash
cd backend
npm run dev
```

```bash
cd frontend/reciperiot-frontend
npm run dev
```

Ledande fråga:

> Om frontend kör på `localhost:5173` och backend på `localhost:3000`, varför behövs CORS?

Svar att tänka mot: webbläsaren ser dem som olika origins. Därför måste backend uttryckligen tillåta frontendens origin.

## Steg 1: Förstå felet i frontendens nuvarande auth

Fil: `frontend/reciperiot-frontend/src/api/authApi.ts`

Titta särskilt på nuvarande rader:

- rad 44-50: `registerUser(username, email)` skickar till `/api/v1/users`
- rad 52-64: `loginUser(email)` hämtar alla användare och skapar `demo-token`
- rad 66-89: token och user sparas i `localStorage`

Det här fungerar som demo, men det följer inte vecka 7:

```ts
export const loginUser = async (email: string) => {
  const users = await requestJson(`${BASE_URL}/api/v1/users`);
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  return {
    token: 'demo-token',
    user,
  };
};
```

Varför är det osäkert?

- Frontend ska inte hämta alla användare för att "logga in".
- Lösenord kontrolleras inte.
- Token är inte signerad av backend.
- Skyddade backend-routes kommer inte lita på `demo-token`.

Koppling till vecka 7:

Backendens `authController.ts` använder `bcrypt.compare(...)` och `jwt.sign(...)`. Det måste vara backend som bestämmer om användaren är inloggad.

## Steg 2: Säkra backendens CORS innan frontend kopplas in

Fil: `backend/src/app.ts`

Nuvarande kod runt rad 13:

```ts
app.use(cors());
```

Kodförslag att skriva av:

```ts
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
  })
);
```

Placera `const allowedOrigin...` direkt efter:

```ts
const app = express();
```

och ersätt `app.use(cors());` med `app.use(cors({ origin: allowedOrigin }));`.

Varför?

I vecka 2 lär du dig middleware-ordning och `cors()`. I vecka 7 börjar säkerheten bli viktigare. Om du lämnar `cors()` helt öppet säger backend i praktiken "alla webbsidor får försöka prata med mig". För lokal utveckling går det ofta bra, men det tränar fel vana.

Vad händer annars?

I produktion kan en annan webbplats lättare försöka göra anrop mot ditt API från användarens webbläsare. CORS är inte hela säkerheten, men det är ett viktigt yttre staket.

Finns det fler lika bra lösningar?

Ja. Du kan tillåta flera origins med en lista:

```ts
const allowedOrigins = [process.env.CORS_ORIGIN, 'http://localhost:5173'];
```

Men för kursvecka 1-7 räcker en origin bra.

## Steg 3: Skapa frontendens API-url

Fil att skapa: `frontend/reciperiot-frontend/.env.local`

Skriv:

```env
VITE_API_URL=http://127.0.0.1:3000
```

Din `authApi.ts` har redan detta på rad 2:

```ts
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
```

Varför?

Det här är kopplat till vecka 1 och 2: klienten behöver veta vilken server den ska kontakta. Vi hårdkodar inte allt i komponenterna, utan samlar API-basen på ett ställe.

Går vi händelserna i förväg?

Lite. Frontend-miljövariabler hör mer till fullstack-deployment än ren backendvecka 1-7. Men vi behöver det redan nu eftersom frontend och backend körs som två separata appar. Det är okej att lägga in nu, för det hjälper dig att inte sprida `localhost:3000` överallt i koden.

## Steg 4: Byt authApi från demo till riktig backend-auth

Fil: `frontend/reciperiot-frontend/src/api/authApi.ts`

Ersätt raderna 44-89 med det här kodförslaget.

Skriv av koden själv och läs namnen högt för dig själv. Det hjälper dig se kontraktet mellan frontend och backend.

```ts
export type AuthUser = {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  return requestJson(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
};

export const loginUser = async (
  identifier: string,
  password: string
): Promise<AuthResponse> => {
  return requestJson(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
};

export const getCurrentUser = async (token: string): Promise<AuthResponse['user']> => {
  const result = await requestJson<{ user: AuthUser }>(`${BASE_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return result.user;
};

export const saveAuthData = (token: string, user: AuthUser): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuthData = (): { token: string; user: AuthUser } | null => {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return null;
  }

  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    clearAuthData();
    return null;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};
```

Ledande frågor:

> Varför ska `registerUser` skicka `password` till `/api/v1/auth/register` men aldrig spara lösenordet i frontend?

> Varför är `id` en `string` nu när backend använder MongoDB?

Svar att tänka mot:

- Lösenordet behövs bara för att backend ska kunna hasha det med bcrypt.
- MongoDB ObjectId skickas till frontend som en sträng.

Koppling till studiematerialet:

- Vecka 3: `AuthUser` och `AuthResponse` är API-kontrakt.
- Vecka 6: frontend kan hjälpa användaren, men backend validerar med Zod.
- Vecka 7: token kommer från backendens `jwt.sign`, inte från frontend.

Vad händer annars?

Om frontend fortsätter skapa `demo-token` kommer `backend/src/middleware/auth.ts` neka skyddade routes, eftersom `jwt.verify(...)` på rad 29 bara godkänner tokens signerade med backendens `JWT_SECRET`.

## Steg 5: Uppdatera UserLogin-komponenten så den skickar password

Fil: `frontend/reciperiot-frontend/src/components/userLogin/UserLogin.tsx`

### 5.1 Byt importen på rad 2

Nu:

```ts
import { loginUser, registerUser, saveAuthData } from "../../api/authApi";
```

Kodförslag:

```ts
import { loginUser, registerUser, saveAuthData, type AuthUser } from "../../api/authApi";
```

Varför?

Du återanvänder samma `AuthUser`-typ som API-lagret. Det är vecka 3-tänk: ett kontrakt, färre dubbla definitioner.

### 5.2 Byt prop-typen runt rad 5-9

Nu:

```ts
type UserLoginProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAuthSuccess: (user: { id: number; email: string; username: string }) => void;
};
```

Kodförslag:

```ts
type UserLoginProps = {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAuthSuccess: (user: AuthUser) => void;
};
```

Varför?

Backend skickar MongoDB-id som `string`, inte `number`. Om frontend låtsas att id är nummer får du typfel eller senare logiska buggar.

### 5.3 Matcha lösenordskravet med backendens Zod-schema

Fil: `backend/src/schemas/auth.schemas.ts`

Backend kräver minst 8 tecken på rad 15:

```ts
.min(8, "Lösenordet måste ha minst 8 tecken")
```

I `UserLogin.tsx`, ändra rad 51 från:

```ts
[password.length < 6, "Lösenordet måste vara minst 6 tecken"],
```

till:

```ts
[password.length < 8, "Lösenordet måste vara minst 8 tecken"],
```

Varför?

Frontend och backend ska inte säga olika saker. Men kom ihåg vecka 6: frontendvalidering är användarstöd, backendvalidering är säkerhet.

### 5.4 Ändra handleRegister runt rad 62-71

Nu:

```ts
const handleRegister = async () => {
  validateRegisterInput();

  const user = await registerUser(username, email);
  const authUser = { id: user.id, email: user.email, username: user.username };

  saveAuthData("demo-token", authUser);
  onAuthSuccess(authUser);
  setSuccess("Registreringen lyckades! Välkommen till RecipeRiot.");
};
```

Kodförslag:

```ts
const handleRegister = async () => {
  validateRegisterInput();

  const result = await registerUser(username, email, password);

  saveAuthData(result.token, result.user);
  onAuthSuccess(result.user);
  setSuccess("Registreringen lyckades! Välkommen till RecipeRiot.");
};
```

Varför?

Backendens register-route skapar användaren, hashar lösenordet och returnerar en riktig JWT. Därför ska frontend spara `result.token`, inte `"demo-token"`.

### 5.5 Ändra handleLogin runt rad 73-79

För att kunna logga in med antingen användarnamn eller e-post behöver login-formuläret ha ett eget state:

```ts
const [loginIdentifier, setLoginIdentifier] = useState("");
```

I login-läget ska fältet se ut ungefär så här:

```tsx
<label className="user-login-label" htmlFor="user-login-identifier">
  Användarnamn eller e-post
</label>
<input
  id="user-login-identifier"
  className="user-login-input"
  type="text"
  value={loginIdentifier}
  onChange={(event) => setLoginIdentifier(event.target.value)}
  placeholder="Användarnamn eller e-post"
  autoComplete="username"
  required
/>
```

Nu:

```ts
const handleLogin = async () => {
  const result = await loginUser(email);

  saveAuthData(result.token, result.user);
  onAuthSuccess(result.user);
  setSuccess("Inloggningen lyckades! Välkommen tillbaka.");
};
```

Kodförslag:

```ts
const handleLogin = async () => {
  const result = await loginUser(loginIdentifier, password);

  saveAuthData(result.token, result.user);
  onAuthSuccess(result.user);
  setSuccess("Inloggningen lyckades! Välkommen tillbaka.");
};
```

Om du vill ha en klickbar länk för glömt lösenord innan backend har ett reset-flöde, lägg den bara i login-läget:

```tsx
{!isRegisterMode && (
  <button
    type="button"
    className="user-login-forgot"
    onClick={handleForgotPassword}
  >
    Glömt lösenordet?
  </button>
)}
```

Och låt den visa ett ärligt meddelande:

```ts
const handleForgotPassword = () => {
  setError("");
  setSuccess(
    "Lösenordsåterställning är inte kopplad ännu. Be en administratör hjälpa dig tills reset-flödet finns på plats."
  );
};
```

Koppling till vecka 7:

Backendens `login` i `backend/src/controllers/authController.ts` gör detta:

- hämtar användare med `.select('+passwordHash')`
- jämför med `bcrypt.compare(password, user.passwordHash)`
- skapar token med `createToken(user)`

Frontend ska bara skicka uppgifterna och ta emot svaret.

## Steg 6: Uppdatera Layout så user-id också är string

Fil: `frontend/reciperiot-frontend/src/components/layout/layout.tsx`

Nuvarande rad 8:

```ts
type AuthUser = { id: number; email: string; username: string };
```

Kodförslag:

```ts
import { clearAuthData, getAuthData, type AuthUser } from "../../api/authApi";
```

och ta bort den lokala typen:

```ts
type AuthUser = { id: number; email: string; username: string };
```

Varför?

Det här är också vecka 3: använd samma typ genom hela frontend. Om `authApi.ts` säger `id: string` men `layout.tsx` säger `id: number` bygger du in en konflikt.

Bra sak du redan har gjort:

`Layout` håller auth-state på ett bra ställe. Navbar behöver bara veta om användaren är inloggad och vad användarnamnet är.

## Steg 7: Testa auth-flödet manuellt

### 7.1 Testa backend direkt först

Använd Thunder Client, Postman eller `curl`.

Register:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"superhemligt"}'
```

Du ska få:

```json
{
  "token": "...",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

Viktigt:

Du ska inte få `passwordHash` i svaret. Det bevarar säkerheten från vecka 7.

Login:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"superhemligt"}'
```

Skyddad route:

```bash
curl http://127.0.0.1:3000/api/v1/auth/me \
  -H "Authorization: Bearer DIN_TOKEN_HÄR"
```

Ledande fråga:

> Vad händer om du tar bort `Authorization`-headern?

Svar att tänka mot: backend ska svara `401`, eftersom `authenticate` kräver en giltig Bearer-token.

### 7.2 Testa via frontend

1. Öppna frontend.
2. Klicka "Logga in".
3. Växla till registrering.
4. Skapa konto med minst 8 tecken i lösenordet.
5. Kontrollera att Navbar visar användarnamnet.
6. Logga ut.
7. Logga in igen med samma e-post och lösenord.

Om något blir fel:

- `Kunde inte ansluta till servern`: backend kör inte eller `VITE_API_URL` är fel.
- `Valideringsfel`: frontend skickar något som backendens Zod-schema inte godkänner.
- `Felaktig e-post eller lösenord`: backend hittade inte användaren eller `bcrypt.compare` misslyckades.
- CORS-fel i webbläsarkonsolen: kontrollera `CORS_ORIGIN` i `backend/.env`.

## Steg 8: Lägg till hjälpfunktion för skyddade anrop

Det här behövs när frontend ska skapa, uppdatera, radera eller forka recept.

Fil: `frontend/reciperiot-frontend/src/api/authApi.ts`

Lägg till längst ner:

```ts
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
```

Varför?

Backendens skyddade recept-routes använder `authenticate`:

- `POST /api/v1/recipes`
- `PATCH /api/v1/recipes/:id`
- `DELETE /api/v1/recipes/:id`
- `POST /api/v1/recipes/:id/fork`

Det ser du i `backend/src/routes/recipes.ts` runt raderna 38-67.

Koppling till vecka 5 och 7:

- Vecka 5: CRUD ska kopplas till rätt användare.
- Vecka 7: användaren identifieras via JWT, inte via ett `createdBy` som frontend själv skickar.

Vad händer annars?

Om frontend försöker skapa recept utan token får du `401 Autentisering krävs`. Det är rätt beteende.

## Steg 9: Koppla recept-API utan att bryta säkerheten

Det här steget är nästa naturliga del när auth fungerar.

Skapa fil: `frontend/reciperiot-frontend/src/api/recipesApi.ts`

Kodförslag:

```ts
import { getAuthHeaders } from './authApi';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

type RecipeIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

export type Recipe = {
  _id: string;
  title: string;
  createdBy: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  originalRef?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateRecipeInput = {
  title: string;
  ingredients: RecipeIngredient[];
  steps: string[];
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || `Fel (${response.status})`);
  }

  return response.json();
};

export const getRecipes = async (): Promise<Recipe[]> => {
  return requestJson(`${BASE_URL}/api/v1/recipes`);
};

export const createRecipe = async (input: CreateRecipeInput): Promise<Recipe> => {
  return requestJson(`${BASE_URL}/api/v1/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(input),
  });
};
```

Varför skickar vi inte `createdBy` från frontend?

För att backend redan gör det säkert i `backend/src/controllers/recipesController.ts` runt rad 47-50:

```ts
const recipe = await Recipe.create({
  ...req.validatedBody,
  createdBy: req.user.id,
});
```

Det är en viktig OWASP-koppling:

- Om frontend själv får skicka `createdBy`, kan en användare låtsas vara någon annan.
- Om backend tar `createdBy` från `req.user.id`, kommer id från verifierad JWT.

Bra tänkt om du reagerar här: det här är Broken Access Control i praktiken.

## Steg 10: Om frontendens receptdata inte matchar backendens schema

Frontend har mockdata i:

```text
frontend/reciperiot-frontend/src/components/data/mockRecipes.ts
```

Backendens `Recipe`-modell kräver:

```ts
title: string;
createdBy: string;
ingredients: { name: string; quantity: number; unit: string }[];
steps: string[];
```

Om frontendens mock-recept har annan form behöver du antingen:

1. Anpassa frontendens typer till backend.
2. Skapa en liten mapper i frontend.
3. Anpassa backendens schema om frontendens form egentligen är bättre.

Vilken lösning är bäst här?

För kursvecka 1-7 är lösning 1 eller 2 oftast bäst. Backend är din källa för API-kontraktet nu, eftersom den har validering, databasmodell och säkerhet.

## Steg 11: Kontrollera att säkerheten bevaras

Gå igenom den här checklistan innan du säger "klart":

- Frontend skickar register till `/api/v1/auth/register`, inte `/api/v1/users`.
- Frontend skickar login till `/api/v1/auth/login`, inte `GET /api/v1/users`.
- Frontend skapar aldrig `"demo-token"`.
- Lösenord sparas inte i `localStorage`.
- Backend returnerar inte `passwordHash`.
- Backend validerar auth-body med Zod.
- Backend hashar lösenord med bcrypt.
- Backend signerar JWT med `JWT_SECRET`.
- Skyddade recept-anrop skickar `Authorization: Bearer <token>`.
- Frontend skickar inte `createdBy` vid receptskapande.
- Backendens CORS är begränsad till frontendens origin.
- `errorHandler` skickar inte stack traces i produktion.

Det här är exakt den typ av kontroll som studiematerialets säkerhetsdel tränar: lita inte på klienten, exponera inte hemligheter, och låt backend fatta säkerhetsbesluten.

## Steg 12: Saker som hör mer till vecka 8-12

Några förbättringar kan kännas lockande nu. Här är hur du ska tänka.

### HttpOnly cookies istället för localStorage

`localStorage` är enkelt för kursvecka 7 och gör JWT-flödet tydligt.

I en mer produktionslik app är `HttpOnly` cookies ofta säkrare eftersom JavaScript inte kan läsa tokenen direkt. Det kräver mer arbete:

- cookie-parser eller motsvarande
- CORS med `credentials: true`
- frontend `fetch(..., { credentials: 'include' })`
- CSRF-tänk

Det är mer vecka 8-12. Lägg inte in det nu om målet är att förstå JWT-grunden.

### Rate limiting på login

För riktig säkerhet bör login skyddas mot brute force.

Det kan vara:

```ts
import rateLimit from 'express-rate-limit';
```

Men det kräver nytt paket och mer säkerhetsdesign. Vi nämner det nu eftersom det skyddar vecka 7-flödet, men du behöver inte implementera det förrän kursen tar upp hårdare produktionssäkerhet.

### Refresh tokens

Just nu har du `JWT_EXPIRES_IN=1h`.

Refresh tokens löser längre sessioner, men är en större auth-design. Det är inte nödvändigt för att koppla frontend till backend i vecka 1-7.

## Slutövning

Besvara de här frågorna innan du kodar klart:

1. Vilken fil i frontend bestämmer vilken backend-url som används?
2. Vilken backend-route skapar en riktig JWT?
3. Varför ska login inte hämta alla användare?
4. Varför ska frontend aldrig skicka `createdBy` när ett recept skapas?
5. Vad gör `authenticate` om token saknas?
6. Varför räcker inte frontendvalidering?

Om du kan svara på dem har du förstått kärnan. Det du gör rätt är att du försöker koppla funktionaliteten till kursens principer, inte bara få knappen att "fungera". Fortsätt öva särskilt på detta:

- se skillnaden mellan klientens ansvar och serverns ansvar
- följa ett request hela vägen: komponent -> API-funktion -> route -> controller -> database -> response
- kontrollera säkerheten vid varje steg

Det är precis det som gör att din kod går från "det funkar" till "det håller".
