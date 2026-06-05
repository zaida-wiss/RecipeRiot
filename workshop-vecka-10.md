# Workshop vecka 10: Validering och felhantering i RecipeRiot

Den här workshoppen går igenom det viktigaste från kursvecka 10 och kopplar det direkt till RecipeRiot. Fokus är att du själv ska förstå och skriva koden steg för steg.

Vecka 10 handlar framför allt om:

- principen "lita inte på klienten"
- validering med Zod
- validering av `req.body`, `req.params` och `req.query`
- skillnaden mellan applikationsvalidering och Mongoose-validering
- centraliserad felhantering i Express
- egna felklasser och konsekventa felresponsformat
- att inte exponera tekniska fel i produktion

I RecipeRiot finns mycket av detta redan i:

- `backend/src/schemas/recipe.schemas.ts`
- `backend/src/middleware/validate.ts`
- `backend/src/errors/AppError.ts`
- `backend/src/middleware/errorHandler.ts`
- `backend/src/routes/recipes.ts`
- `backend/src/app.ts`

Målet är inte att memorera allt. Målet är att du ska se mönstret: först beskriver vi vilken data API:t accepterar, sedan stoppar vi fel data innan den når controllern, och till sist skickar vi fel på ett konsekvent sätt.

## 1. Principen: lita inte på klienten

Fundera först:

- Vad händer om frontend skickar en tom titel?
- Vad händer om någon skickar `page=-100`?
- Vad händer om någon skickar ett ogiltigt MongoDB-id?
- Ska controllern behöva kontrollera allt detta själv?

Det du redan är på rätt väg med är att du tittar på raden:

```ts
envSchema.parse(process.env);
```

Det är samma tänk som i vecka 10: rå data kommer in, ett schema kontrollerar den, och appen använder bara data som har blivit godkänd.

I API-validering är den råa datan till exempel:

```ts
req.body
req.params
req.query
```

Det viktiga är: all data från klienten är `unknown` tills vi har validerat den.

## 2. Installera och importera Zod

Kursens grundidé är att använda Zod för att beskriva reglerna för data.

Kontrollera först att Zod finns:

```bash
cd backend
npm install zod
```

I RecipeRiot finns Zod redan, så du behöver normalt inte köra installationen igen.

Ett minimalt exempel:

```ts
import { z } from "zod";

const recipeSchema = z.object({
  title: z.string().min(2),
});

const recipe = recipeSchema.parse({
  title: "Pasta",
});
```

Varför gör vi så?

`z.object(...)` beskriver formen på objektet. `.parse(...)` kontrollerar data. Om datan är fel kastar Zod ett valideringsfel.

Om vi inte gör detta kan fel data gå vidare till databasen eller orsaka konstiga buggar senare i flödet.

En lika bra lösning hade varit att validera manuellt med `if`-satser, men Zod blir tydligare när projektet växer.

## 3. Skapa schema för request body

I RecipeRiot finns receptvalideringen i `backend/src/schemas/recipe.schemas.ts`.

Skriv av en enkel version först:

```ts
import { z } from "zod";

export const createRecipeSchema = z.object({
  title: z
    .string()
    .min(2, "Titel måste ha minst 2 tecken")
    .max(200, "Titel får inte överstiga 200 tecken")
    .trim(),
});
```

Ledande frågor:

- Varför räcker det inte att bara skriva `z.string()`?
- Vad händer om användaren skickar `" "` som titel?
- Varför är felmeddelandet på svenska bra här?

Det viktiga här är att schemat beskriver API-reglerna, inte bara databasen. API:t säger: en titel måste vara text, ha rimlig längd och trimmas.

RecipeRiots färdiga schema går lite längre och validerar även ingredienser och steg:

```ts
const ingredientSchema = z.object({
  name: z.string().min(1, "Ingrediensnamn är obligatoriskt").max(100).trim(),
  quantity: z.number().positive("Mängd måste vara ett positivt tal"),
  unit: z.string().min(1, "Enhet är obligatorisk").max(50).trim(),
});

export const createRecipeSchema = z.object({
  title: z
    .string()
    .min(2, "Titel måste ha minst 2 tecken")
    .max(200, "Titel får inte överstiga 200 tecken")
    .trim(),
  ingredients: z.array(ingredientSchema).optional().default([]),
  steps: z
    .array(z.string().min(1, "Steg får inte vara tomt").max(1000).trim())
    .optional()
    .default([]),
});
```

Bra att öva på: se skillnaden mellan ett enkelt schema och ett schema med inbäddade objekt.

## 4. Validera query-parametrar

Query-parametrar kommer ofta in som strängar.

Exempel:

```txt
GET /api/v1/recipes?page=2&limit=10&search=pasta
```

`page` och `limit` ser ut som tal, men i Express kommer de normalt från URL:en som text.

Skriv av:

```ts
export const listRecipesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, "Sida måste vara minst 1")),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100, "Max 100 recept per sida")),
  search: z.string().optional(),
});
```

Varför gör vi så?

Controllern vill räkna ut:

```ts
const skip = (page - 1) * limit;
```

Om `page` och `limit` inte är riktiga positiva heltal kan pagineringen bli fel. Klienten skulle också kunna begära orimligt många poster med `limit=999999`.

En annan bra lösning är `z.coerce.number()`, ungefär som i `backend/src/config/env.ts`:

```ts
page: z.coerce.number().int().min(1).default(1)
```

Båda lösningarna är rimliga. Projektet använder `transform(...).pipe(...)`, vilket gör steget från sträng till tal extra synligt.

## 5. Validera URL-parametrar

Ett MongoDB ObjectId har 24 hex-tecken.

Skriv av:

```ts
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Ogiltigt MongoDB ObjectId-format"),
});
```

Ledande fråga:

Varför är det bättre att stoppa ett felaktigt id i middleware än att låta `Recipe.findById(id)` försöka själv?

Svar: då får klienten ett tydligt `400 Bad Request` i stället för att felet kanske blir ett Mongoose `CastError` senare. Det blir lättare att felsöka och API:t känns mer förutsägbart.

## 6. Skapa valideringsmiddleware

Kursens grundmönster är:

1. Ta emot ett schema.
2. Kör `safeParse`.
3. Om valideringen misslyckas, skicka felet vidare med `next`.
4. Om den lyckas, gå vidare till controllern.

En enkel version:

```ts
import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    req.body = result.data;
    next();
  };
}
```

Varför `safeParse` här och inte `parse`?

`parse` kastar ett fel direkt. `safeParse` ger oss ett resultatobjekt:

```ts
{ success: true, data: ... }
```

eller:

```ts
{ success: false, error: ... }
```

Det gör middleware-koden lättare att styra.

RecipeRiot har en mer komplett version i `backend/src/middleware/validate.ts`. Den kan validera `body`, `params` och `query` i samma middleware:

```ts
export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: ValidationIssue[] = [];

    validateSchema({
      schema: schemas.body,
      value: req.body,
      location: "body",
      saveValidatedData: (data) => {
        req.validatedBody = data;
      },
      errors,
    });

    if (errors.length > 0) {
      next(new ValidationError("Valideringsfel", errors));
      return;
    }

    next();
  };
}
```

Projektets version sparar godkänd data i:

```ts
req.validatedBody
req.validatedParams
req.validatedQuery
```

Det är en bra vana. Då vet controllern att den använder kontrollerad data, inte rå klientdata.

## 7. Koppla middleware till routes

I kursens enklaste form:

```ts
router.post("/", validateBody(createRecipeSchema), createRecipe);
```

I RecipeRiot använder vi den mer flexibla varianten:

```ts
router.post(
  "/",
  authenticate,
  validateRequest({ body: createRecipeSchema }),
  createRecipe
);
```

För en route med URL-parameter:

```ts
router.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  getRecipeById
);
```

För en route med query-parametrar:

```ts
router.get(
  "/",
  validateRequest({ query: listRecipesQuerySchema }),
  getAllRecipes
);
```

Ledande fråga:

Varför ligger `validateRequest` före controllern?

För att controllern bara ska behöva jobba med data som redan är godkänd. Det gör controllern renare och lättare att läsa.

Det här gör du rätt när du bygger backend: du separerar ansvar. Routes kopplar ihop flödet, middleware kontrollerar requesten, controllers gör jobbet.

## 8. Använd validerad data i controllern

När query-valideringen är klar kan controllern använda:

```ts
const { page, limit, search } = req.validatedQuery;
```

När param-valideringen är klar kan controllern använda:

```ts
const { id } = req.validatedParams;
```

När body-valideringen är klar kan controllern använda:

```ts
const recipe = await Recipe.create({
  ...req.validatedBody,
  createdBy: userId,
});
```

Varför är detta viktigt?

Om controllern använder `req.body` direkt måste du komma ihåg överallt att datan kanske är fel. Med `req.validatedBody` blir det tydligt: den här datan har passerat Zod.

En annan bra lösning är att skriva tillbaka validerad data till `req.body`, men RecipeRiots lösning är tydligare för inlärning eftersom namnet visar vad som har hänt.

## 9. Mongoose-validering vs applikationsvalidering

Vecka 10 skiljer på två nivåer:

- Zod validerar requesten innan controllern körs.
- Mongoose validerar dokumentet innan det sparas i databasen.

Exempel på Zod:

```ts
title: z.string().min(2).max(200).trim()
```

Exempel på Mongoose kan se ut ungefär så här:

```ts
title: {
  type: String,
  required: true,
  minlength: 2,
  maxlength: 200,
  trim: true,
}
```

Varför ha båda?

Zod ger klienten snabb och tydlig feedback. Mongoose skyddar databasen om något ändå tar sig förbi API-lagret, till exempel intern kod eller framtida routes.

Om du bara har Mongoose-validering blir API-felen ofta mindre pedagogiska. Om du bara har Zod kan databasen vara oskyddad från annan kod som skapar dokument direkt.

## 10. Egna felklasser

I RecipeRiot finns en basklass:

```ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

Sedan kan vi skapa tydliga fel:

```ts
export class NotFoundError extends AppError {
  constructor(message = "Resursen hittades inte") {
    super(message, 404);
  }
}
```

Och använda dem i controllern:

```ts
const recipe = await Recipe.findById(id);

if (!recipe) {
  throw new NotFoundError("Receptet hittades inte");
}
```

Varför är detta bättre än:

```ts
res.status(404).json({ message: "Receptet hittades inte" });
```

Det går att göra så också, och i små appar är det okej. Men med egna felklasser kan vi samla all felrespons i en central error handler. Då slipper varje controller bestämma exakt hur fel ska skickas.

## 11. Fånga async-fel och skicka till error handler

Express fångar inte alltid async-fel automatiskt på ett tydligt sätt. Därför använder projektet ett `asyncHandler`-mönster:

```ts
type AsyncController = (req: Request, res: Response) => Promise<void>;

const asyncHandler = (handler: AsyncController): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void handler(req, res).catch(next);
  };
};
```

Sedan kan controllern skrivas renare:

```ts
export const getRecipeById = asyncHandler(async (req, res): Promise<void> => {
  const { id } = req.validatedParams;
  const recipe = await getRecipeOrThrow(id);

  res.json(recipe);
});
```

Varför behövs `next`?

`next(error)` skickar felet vidare till Express felhanteringsmiddleware. Utan det kan fel fastna, ge otydliga svar eller krascha servern på fel sätt.

## 12. Centraliserad error handler

En Express error handler har fyra parametrar:

```ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(500).json({ message: "Ett serverfel inträffade" });
}
```

Det viktiga är att den ligger sist i `app.ts`:

```ts
app.use(errorHandler);
```

RecipeRiots version hanterar flera fall:

```ts
if (err instanceof AppError) {
  sendAppError(err, res, isDevelopment);
  return;
}

if (err.name === "ValidationError") {
  sendMongooseValidationError(err, res);
  return;
}

if (err.name === "CastError") {
  res.status(400).json({ message: "Ogiltigt ID-format" });
  return;
}

sendUnexpectedError(err, res, isDevelopment);
```

Ledande fråga:

Varför kontrollerar vi `AppError` först?

För att det är våra egna förväntade fel. De har redan en statuskod och ett meddelande som vi vill skicka till klienten.

## 13. Konsekvent felrespons

Ett bra API bör svara på ungefär samma form varje gång något går fel.

Exempel:

```json
{
  "message": "Valideringsfel",
  "errors": [
    {
      "field": "title",
      "message": "Titel måste ha minst 2 tecken"
    }
  ]
}
```

Varför är detta viktigt?

Frontend kan visa felen enklare om formatet är förutsägbart. Om varje route skickar fel på olika sätt måste frontend skriva specialkod för varje endpoint.

En annan bra lösning är att alltid ha ett ännu mer strukturerat format:

```json
{
  "success": false,
  "error": {
    "message": "Valideringsfel",
    "details": []
  }
}
```

Det är också bra. Det viktigaste är att projektet väljer ett format och håller sig till det.

## 14. Produktion vs utveckling

I utveckling vill vi ofta se stack trace:

```ts
...(isDevelopment && { stack: err.stack })
```

I produktion ska vi inte exponera tekniska detaljer.

Bra:

```json
{
  "message": "Ett oväntat serverfel inträffade"
}
```

Dåligt i produktion:

```json
{
  "message": "Cannot read properties of undefined",
  "stack": "Error at src/controllers/..."
}
```

Varför?

Tekniska fel kan avslöja filnamn, implementation och ibland känslig information. Klienten behöver veta att något gick fel, men inte exakt hur servern är byggd.

Här knyts vecka 10 ihop med `backend/src/config/env.ts`:

```ts
const isDevelopment = env.NODE_ENV === "development";
```

Configuration styr alltså hur mycket felinformation API:t skickar.

## 15. Testa flödet manuellt

Starta backend:

```bash
cd backend
npm run dev
```

Testa sedan några felaktiga requests i Thunder Client, Postman eller curl.

Tom titel:

```bash
curl -X POST http://localhost:3000/api/v1/recipes \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
```

Ogiltig query:

```bash
curl "http://localhost:3000/api/v1/recipes?page=0&limit=999"
```

Ogiltigt id:

```bash
curl "http://localhost:3000/api/v1/recipes/abc"
```

Fråga dig själv:

- Får jag rätt statuskod?
- Får jag ett tydligt `message`?
- Får jag detaljerade fältfel där det behövs?
- Kommer felet från middleware eller controller?

Det är starkt att öva på att felsöka hela kedjan: route -> middleware -> schema -> controller -> errorHandler.

## 16. Mini-övning: implementera en ny validering

Välj en route i projektet. Börja gärna med auth eftersom den är tydlig:

- `backend/src/schemas/auth.schemas.ts`
- `backend/src/routes/auth.ts`

Ledande frågor:

- Vilken data skickar klienten vid registrering?
- Vilka fält måste finnas?
- Vilka fält behöver min/max?
- Ska email normaliseras med `.toLowerCase()`?

Exempel:

```ts
export const registerSchema = z.object({
  username: z
    .string()
    .min(5, "Användarnamn måste ha minst 5 tecken")
    .max(50, "Användarnamn får inte överstiga 50 tecken")
    .trim(),
  email: z
    .string()
    .email("Ogiltig e-postadress")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Lösenordet måste ha minst 8 tecken")
    .max(100, "Lösenordet är för långt"),
});
```

Koppla sedan schemat i routen:

```ts
router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  register
);
```

Det centrala att öva mer på är kopplingen mellan schema och route. När du kan se den kopplingen blir backend mycket lättare att bygga.

## 17. Checklista för vecka 10 i RecipeRiot

Använd den här checklistan när du granskar din kod:

- Har varje route som tar emot body ett Zod-schema?
- Har routes med `:id` ett params-schema?
- Har list-routes ett query-schema för `page`, `limit` och `search`?
- Använder controllern `req.validatedBody`, `req.validatedParams` eller `req.validatedQuery`?
- Skickas fel vidare med `next(error)` eller `throw` inne i `asyncHandler`?
- Finns egna felklasser för vanliga API-fel?
- Ligger `app.use(errorHandler)` sist i `app.ts`?
- Visar produktion inte stack traces?
- Finns Mongoose-validering som extra skydd vid databaslagret?

## 18. Sammanfattning

Det viktigaste från vecka 10 är inte bara Zod-koden. Det viktigaste är ansvarsfördelningen:

```txt
Klientdata
  -> route
  -> validateRequest med Zod
  -> controller med validerad data
  -> Mongoose som extra skydd
  -> errorHandler för konsekventa felsvar
```

Du är på rätt spår när du stannar upp vid rader som `.parse(...)`, `safeParse(...)`, `next(...)` och `app.use(errorHandler)`. Det är sådana små rader som styr hela kvaliteten på ett backend-API.

Öva särskilt på:

- att skriva Zod-scheman själv
- att se skillnaden mellan `body`, `params` och `query`
- att förstå varför fel skickas vidare till en central error handler
- att förklara varför vi inte litar på klienten

När du kan förklara det med egna ord har du förstått kärnan i vecka 10.
