# Workshop: Bygg vidare RecipeRiot med REST API-design, routing och middleware (Kursvecka 2)

Den här workshopen bygger vidare på ditt befintliga projekt i `backend/` och fokuserar på kursvecka 2:
- bättre REST-struktur
- API-versionering
- middleware i praktiken
- konsekvent felhantering
- filtrering, sortering och paginering

Målet är att du ska lämna workshopen med ett mer "riktigt" API som är lättare att testa, förstå och bygga vidare på.

---

## 0. Förutsättningar

Du ska redan ha:
- fungerande Express-app
- routes/controllers/middleware
- endpoints för GET, POST, PATCH och DELETE för recept

Kör servern:
```bash
cd backend
npm run dev
```

---

## 1. Installera middleware-paket

Installera paket du ska öva på i vecka 2:
```bash
npm install cors morgan
```

---

## 2. Versionshantera API:et

### Uppgift
Byt från:
- `/recipes`

Till:
- `/api/v1/recipes`

### Tips
I `src/app.js`, ändra monteringen av routern.

Från:
```js
app.use('/recipes', recipesRouter);
```

Till:
```js
app.use('/api/v1/recipes', recipesRouter);
```

### Test
- `GET http://localhost:3000/api/v1/recipes`

---

## 3. Lägg till cors och morgan i appen

### Uppgift
I `src/app.js`:
1. Importera `cors` och `morgan`
2. Registrera middleware före routes

Exempel:
```js
const cors = require('cors');
const morgan = require('morgan');

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);
```

### Test
Skicka valfria requests och se att:
- anrop loggas tydligare i terminalen (morgan)
- appen tillåter cross-origin requests (cors)

---

## 4. Konsekvent svarformat för listor

### Uppgift
Ändra `getAllRecipes` så att svaret alltid har `data` och `meta`.

Nu har du ungefär:
```js
res.json(recipes);
```

Ändra till något i stil med:
```js
res.json({
  data: recipes,
  meta: {
    total: recipes.length,
  },
});
```

### Test
- `GET /api/v1/recipes` ska ge objekt med `data` och `meta`

---

## 5. Filtrering, sortering och paginering

### Uppgift
Bygg ut `getAllRecipes` med query-parametrar:
- filtrering: `createdBy`
- sortering: `sort` (`title` eller `createdAt`)
- ordning: `order` (`asc` eller `desc`)
- paginering: `page`, `limit`

### Exempel att stödja
- `/api/v1/recipes?createdBy=Zaida`
- `/api/v1/recipes?sort=title&order=asc`
- `/api/v1/recipes?page=1&limit=2`

### Målformat
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 2,
    "total": 10,
    "totalPages": 5
  }
}
```

---

## 6. Enhetligt felformat

### Uppgift
Skapa ett konsekvent felobjekt:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Receptet hittades inte",
    "status": 404
  }
}
```

Börja med att uppdatera svar i controllern för:
- 400
- 404

---

## 7. 404-handler för okända routes

### Uppgift
Lägg till i slutet av `src/app.js` (efter dina routes):
```js
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Sokvagen ${req.path} finns inte`,
      status: 404,
    },
  });
});
```

---

## 8. Global error handler middleware

### Uppgift
Skapa ny fil: `src/middleware/errorHandler.js`

Innehall:
```js
module.exports = (err, req, res, next) => {
  console.error('[ERROR]', err.message);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ett ovantat fel intraffade',
      status: 500,
    },
  });
};
```

Registrera den sist i `src/app.js`:
```js
const errorHandler = require('./middleware/errorHandler');
// ... routes och 404-handler
app.use(errorHandler);
```

---

## 9. Returnera Location-header vid POST

### Uppgift
I `createRecipe`, efter att nytt recept skapats:
- sätt `Location`-header till nya resursens URL

Exempel:
```js
res
  .status(201)
  .location(`/api/v1/recipes/${newRecipe.id}`)
  .json({ data: newRecipe });
```

---

## 10. Testplan i Thunder Client/Postman

Kör igenom minst dessa tester:

1. `GET /api/v1/recipes`
2. `GET /api/v1/recipes/999` (ska ge 404-felobjekt)
3. `POST /api/v1/recipes` utan title eller createdBy (ska ge 400-felobjekt)
4. `PATCH /api/v1/recipes/:id` med ett fält
5. `DELETE /api/v1/recipes/:id`
6. `GET /api/v1/recipes?sort=title&order=asc`
7. `GET /api/v1/recipes?page=1&limit=2`
8. Okand route, t.ex. `/api/v1/unknown` (ska ge 404-felobjekt)

---

## 11. Checklista Kursvecka 2

Bocka av nar klart:

- [ ] API-versionering: `/api/v1/...`
- [ ] `cors` installerat och aktiverat
- [ ] `morgan` installerat och aktiverat
- [ ] `getAllRecipes` med `data` + `meta`
- [ ] filtrering/sortering/paginering med query-parametrar
- [ ] konsekvent felobjekt
- [ ] 404-handler for okanda routes
- [ ] global error handler
- [ ] POST returnerar 201 + Location-header

---

## 12. Reflektionsfragor

1. Nar ar `204 No Content` battre an `200 OK`?
2. Vad vinner ni pa att ha enhetligt felobjekt i hela API:t?
3. Nar ska data ligga i URL-path, query respektive body?
4. Vilka risker finns om ni inte versionshanterar API:t tidigt?

---

## Stretch

- Lagg till route: `GET /api/v1/health` -> `{ status: 'ok' }`
- Lagg till enkel request-id middleware som satter `req.requestId`
- Lagg till en route-fil till (t.ex. users) for att ova modularisering

Lycka till! Om du vill kan vi ta denna workshop steg for steg tillsammans och implementera varje del direkt i din kodbas.
