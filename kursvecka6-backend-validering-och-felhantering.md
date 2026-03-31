# Backendutveckling i Node.js, databaser och säkerhet – Kursvecka 6

## Studiematerial: Inputvalidering och felhantering

### Introduktion
Vi har nu fem veckor bakom oss i kursen. Vi behärskar Node.js och Express, kan designa REST API:er med tydlig struktur, har lagt till TypeScript för säkrare typning och kopplat vår backend till MongoDB via Mongoose. Vi kan hämta, skapa, uppdatera och ta bort data – och vi har börjat testa vår kod. Det är en imponerande grund.

Men det finns ett hål i det vi byggt hittills. Vi har i stor utsträckning litat på att klienten skickar korrekt data. Vi har antagit att request body innehåller rätt fält, att params är i rätt format och att query-parametrar har rimliga värden. Det är ett antagande vi aldrig kan göra i ett riktigt system.

Kursvecka 6 handlar om att täppa till det hålet på två sätt: genom robust inputvalidering och genom genomtänkt felhantering. Dessa två ämnen hänger tätt samman – vi validerar input för att fånga fel tidigt, och vi hanterar felen på ett sätt som är säkert, konsekvent och användbart för den som anropar vårt API.

Vi introducerar Zod – ett kraftfullt valideringsbibliotek som låter oss deklarera exakt vad vi förväntar oss av inkommande data och automatiskt generera meningsfulla felmeddelanden när data inte stämmer. Vi bygger också ett mönster för centraliserad felhantering i Express som gör att alla fel, oavsett var de uppstår i applikationen, hanteras på ett enhetligt sätt.

Det är viktigt att förstå att detta inte bara handlar om att göra API:et trevligare att använda. Det handlar om säkerhet. Okontrollerad input är en av de vanligaste vägarna in för attacker mot webbapplikationer. Att validera och städa indata är ett av de grundläggande försvarsmönstren vi alltid ska tillämpa.

---

## Principen: Don't trust the client
Den kanske viktigaste principen inom backendutveckling och webbsäkerhet kan sammanfattas i fyra ord: **don't trust the client**. Det innebär att vi aldrig kan förlita oss på att data som skickas till vår server är korrekt, komplett, välformaterad eller ens välmenande.

Det kan tyckas självklart att en användare kan skicka fel data av misstag. Det som är viktigare att förstå är att en angripare aktivt kan skicka skadlig data med avsikt att bryta vår applikation, kringgå vår affärslogik eller komma åt data de inte har rätt till. Och det behövs inte avancerad kunskap – det räcker med ett verktyg som Postman eller curl för att skicka precis vilket HTTP-anrop som helst till vår server.

### Exempel på attacker
- Felaktiga typer: `{ "age": "tjugofem" }`
- Extremt långa strängar: `{ "name": "A".repeat(1000000) }`
- Saknade obligatoriska fält: `{}`
- Extra fält: `{ "name": "Anna", "role": "admin" }`
- Skadlig kod i strängar: `{ "name": "<script>alert(1)</script>" }`
- Specialtecken och operatorer: `{ "email": { "$gt": "" } }`

### Varför räcker inte frontend-validering?
Frontend-validering är ett UX-verktyg, inte ett säkerhetsverktyg. All validering som har säkerhetsmässig betydelse måste göras på servern.

---

## Manuell validering i Express
Exempel på manuell validering i en route:
```js
app.post('/api/products', (req, res) => {
  const { name, price, category } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'name är obligatoriskt och måste vara en sträng' });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ message: 'price måste vara ett positivt tal' });
  }
  if (!category || !['electronics', 'clothing', 'food'].includes(category)) {
    return res.status(400).json({ message: 'category måste vara electronics, clothing eller food' });
  }
  const product = { name: name.trim(), price, category };
  res.status(201).json(product);
});
```
Problem: Mycket kod, inkonsekventa fel, svår att återanvända, rapporterar bara första felet.

---

## Introduktion till Zod
Zod är ett TypeScript-first valideringsbibliotek med ett elegant och läsbart API. Det låter oss definiera schemas och validera data mot dessa.

Installera Zod:
```bash
npm install zod
```

### Exempel på Zod-schema
```js
const { z } = require('zod');
const createProductSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'food']),
  description: z.string().max(500).optional(),
  inStock: z.boolean().default(true),
});
```

Validering:
```js
const result = createProductSchema.safeParse({ name: 'Laptop', price: 8999, category: 'electronics' });
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.issues);
}
```

### Felmeddelanden från Zod
Zod samlar alla fel och rapporterar dem samtidigt:
```js
const result = createProductSchema.safeParse({ name: 'A', price: -100, category: 'furniture' });
if (!result.success) {
  console.log(result.error.issues);
}
```

---

## Validera body, params och query
- **Body:** Validera JSON-objekt direkt mot ett schema.
- **Params:** Alltid strängar, konvertera och validera.
- **Query:** Alltid strängar, konvertera och validera.

Exempel på validering av query-parametrar:
```js
const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(val => parseInt(val, 10)).pipe(z.number().int().min(1)),
  limit: z.string().optional().default('20').transform(val => parseInt(val, 10)).pipe(z.number().int().min(1).max(100)),
  search: z.string().optional(),
});
```

---

## Återanvändbara valideringsmiddleware
Skapa en middleware-fabrik för validering:
```js
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Valideringsfel',
        errors: result.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    req.validatedBody = result.data;
    next();
  };
}
```

Utöka för params och query:
```js
function validateRequest(schemas) {
  return (req, res, next) => {
    const errors = [];
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...result.error.issues.map(i => ({ location: 'body', field: i.path.join('.'), message: i.message })));
      } else {
        req.validatedBody = result.data;
      }
    }
    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...result.error.issues.map(i => ({ location: 'params', field: i.path.join('.'), message: i.message })));
      } else {
        req.validatedParams = result.data;
      }
    }
    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...result.error.issues.map(i => ({ location: 'query', field: i.path.join('.'), message: i.message })));
      } else {
        req.validatedQuery = result.data;
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Valideringsfel', errors });
    }
    next();
  };
}
```

---

## Felhantering i Express
Felhantering görs med en centraliserad error handler-middleware:
```js
function errorHandler(err, req, res, next) {
  console.error({ message: err.message, stack: err.stack, path: req.path, method: req.method });
  const statusCode = err.statusCode || 500;
  const response = {
    message: err.message || 'Ett oväntat fel inträffade',
    errors: err.errors || undefined,
  };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  if (statusCode === 500) {
    response.message = 'Ett oväntat serverfel inträffade';
  }
  res.status(statusCode).json(response);
}
```

Registrera sist i din app:
```js
app.use(errorHandler);
```

---

## Egna felklasser
Exempel på felklasser:
```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
class NotFoundError extends AppError {
  constructor(message = 'Resursen hittades inte') {
    super(message, 404);
  }
}
class ValidationError extends AppError {
  constructor(message = 'Valideringsfel', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}
// ... fler felklasser ...
```

---

## Konsekvent felrespons-format
- `message`: Läsbar beskrivning av felet
- `errors`: (valfri) Array med specifika valideringsfel
- HTTP-statuskod: Alltid korrekt

Exempel:
```json
{
  "message": "Valideringsfel",
  "errors": [
    { "field": "email", "message": "Ogiltig e-postadress" },
    { "field": "name", "message": "Namn måste ha minst 2 tecken" }
  ]
}
```

---

## Undvika känslig information i felmeddelanden
- Exponera aldrig stack traces, databasfel, interna sökvägar eller versionsinfo till klienten i produktion.
- Ha olika beteende för utveckling och produktion.

---

## Sammanfattning
- Validera all inkommande data på servern
- Använd Zod för deklarativ och återanvändbar validering
- Separera validering från affärslogik med middleware
- Använd centraliserad felhantering och egna felklasser
- Exponera aldrig känslig information i felmeddelanden

---

## Resurser
- [Zod officiell dokumentation](https://zod.dev)
- [Express error handling](https://expressjs.com/en/guide/error-handling.html)
- [MDN HTTP statuskoder](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- YouTube: "Zod Tutorial" av Matt Pocock
- YouTube: "Node.js Error Handling Best Practices"
