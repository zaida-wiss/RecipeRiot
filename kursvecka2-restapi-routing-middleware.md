# Backendutveckling i Node.js, databaser och säkerhet – Kursvecka 2

## Studiematerial: REST API-design, routing och middleware

### Introduktion
Den här veckan fokuserar vi på tre saker: hur vi designar ett välstrukturerat REST API, hur vi organiserar koden i separata filer och moduler, och hur vi använder middleware på ett genomtänkt sätt. Det är här vi lägger grunden för ett produktionsklart system.

---

## REST API-design i praktiken
- Använd substantiv i plural i URL:er: `/users`, `/products`
- Använd kebab-case: `/blog-posts`
- Använd hierarki för relationer: `/users/42/orders`
- Versionshantera API:et: `/api/v1/users`
- Håll URL:erna platta

Exempel på endpoints:
- `GET /api/v1/products` – Hämta alla produkter
- `POST /api/v1/products` – Skapa en ny produkt
- `GET /api/v1/products/:id` – Hämta en specifik produkt
- `PATCH /api/v1/products/:id` – Uppdatera delar av produkten
- `DELETE /api/v1/products/:id` – Ta bort produkten

### Filtrering, sortering och paginering
- Filtrering: `/api/v1/products?category=electronics&inStock=true`
- Sortering: `/api/v1/products?sort=price&order=asc`
- Paginering: `/api/v1/products?page=2&limit=20`

Svarformat:
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

---

## HTTP-statuskoder – välja rätt kod
- **200 OK** – Lyckad GET, PUT, PATCH
- **201 Created** – Lyckad POST (inkludera Location-header)
- **204 No Content** – Lyckad DELETE eller PATCH utan data
- **400 Bad Request** – Felaktig data
- **401 Unauthorized** – Ej autentiserad
- **403 Forbidden** – Saknar behörighet
- **404 Not Found** – Resursen finns inte
- **409 Conflict** – T.ex. dubblettdata
- **422 Unprocessable Entity** – Valideringsfel
- **500 Internal Server Error** – Oväntat serverfel

Konsekvent felformat:
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Ingen användare med id 42 hittades",
    "status": 404
  }
}
```

---

## Strukturera Express-projektet
Rekommenderad mappstruktur:
```
mitt-api/
  src/
    routes/
      users.js
      products.js
    controllers/
      usersController.js
      productsController.js
    middleware/
      logger.js
      errorHandler.js
    app.js
    server.js
  .env
  .gitignore
  package.json
```

### Exempel på route-fil
```js
// src/routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
router.get('/', usersController.getAllUsers);
router.post('/', usersController.createUser);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
module.exports = router;
```

### Exempel på controller
```js
// src/controllers/usersController.js
let users = [ ... ];
const getAllUsers = (req, res) => { res.json({ data: users, meta: { total: users.length } }); };
const getUserById = (req, res) => { ... };
const createUser = (req, res) => { ... };
const updateUser = (req, res) => { ... };
const deleteUser = (req, res) => { ... };
module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
```

### Exempel på app.js
```js
const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Sökvägen ${req.path} finns inte`, status: 404 } });
});
module.exports = app;
```

---

## Middleware i praktiken
- **cors**: Hanterar cross-origin requests
- **morgan**: Loggar HTTP-anrop
- Egna middleware: loggning, validering, felhantering

Exempel på loggnings-middleware:
```js
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};
module.exports = logger;
```

Felhanteringsmiddleware:
```js
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: { code: 'INTERNAL_SERVER_ERROR', message: 'Ett oväntat fel inträffade', status: 500 } });
};
module.exports = errorHandler;
```

Registrera felhanteraren sist i app.js:
```js
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);
```

---

## Komplett app.js med all middleware
```js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Sökvägen ${req.path} finns inte`, status: 404 } });
});
app.use(errorHandler);
module.exports = app;
```

---

## API-versionshantering
- Inkludera alltid `/api/v1/` i URL:erna från start
- Brytande ändringar kräver ny version

---

## Testa API:et med Postman och Thunder Client
- Testa alla endpoints: happy path, saknade fält, 404, fel Content-Type
- Använd Collections och miljövariabler för olika miljöer

---

## Checkpoint: Förberedelse inför kursvecka 2
- Installerat cors och morgan
- Skapat projektstrukturen med src/routes/, src/controllers/, src/middleware/
- Testat minst ett GET- och ett POST-anrop i Postman eller Thunder Client
- Läst igenom boiler room-instruktionerna

Reflektera: Hur avgör man om ett fält ska vara i URL-sökvägen, query string eller request body? När är det rätt att returnera 204 istället för 200? Hur tänker ni kring ansvarsfördelningen i ert boiler room-projekt?

---

## Sammanfattning
- REST API-design: resurser, URL:er, statuskoder, felformat
- Struktur: routes, controllers, middleware, app.js, server.js
- Middleware: cors, morgan, egna funktioner
- API-versionshantering
- Testning med Postman/Thunder Client

---

## Resurser för fördjupning
- [Express Router](https://expressjs.com/en/guide/routing.html)
- [Express Middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [morgan](https://github.com/expressjs/morgan)
- [cors](https://github.com/expressjs/cors)
- [REST API Design Best Practices – freeCodeCamp](https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/)
- [MDN HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Postman Learning Center](https://learning.postman.com/docs/getting-started/overview/)
- [Thunder Client](https://github.com/rangav/thunder-client-support)
