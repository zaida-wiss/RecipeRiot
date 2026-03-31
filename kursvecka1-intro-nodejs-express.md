# Backendutveckling i Node.js, databaser och säkerhet – Kursvecka 1

## Introduktion

Den här veckan introduceras du till backendutveckling med Node.js och Express. Du får förståelse för skillnaden mellan frontend och backend, klient-server-modellen, HTTP-metoder och statuskoder, samt hur Node.js och Express fungerar. Veckan avslutas med att du sätter upp din första Express-server och lär dig grunderna i API-design.

---

## Vad är backend?

Backend är serversidan av ett system – den del som hanterar logik, datalagring, säkerhet och kommunikation. Backend fungerar som en central koordinator som tar emot anrop från klienter (t.ex. webbläsare eller mobilappar), bearbetar data och returnerar svar.

### Klient-server-modellen
- **Klienten** initierar alltid kommunikationen (t.ex. via HTTP-anrop).
- **Servern** är stateless – varje anrop behandlas oberoende.
- **Svaret** är strukturerat, oftast i JSON-format.

---

## HTTP-metoder och statuskoder

### Vanliga HTTP-metoder
- **GET** – Hämta en resurs (ska inte förändra data)
- **POST** – Skapa en ny resurs
- **PUT** – Ersätt en hel resurs
- **PATCH** – Uppdatera delar av en resurs
- **DELETE** – Ta bort en resurs

### Viktiga statuskoder
- **2xx**: Framgång (200 OK, 201 Created, 204 No Content)
- **4xx**: Klientfel (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity)
- **5xx**: Serverfel (500 Internal Server Error, 503 Service Unavailable)

> **Tips:** Returnera alltid rätt statuskod – det underlättar för klienten att hantera svar korrekt.

---

## Node.js – JavaScript på servern

Node.js är en JavaScript-runtime byggd på V8-motorn. Den möjliggör att köra JavaScript utanför webbläsaren, t.ex. på en server. Node.js använder en eventloop och non-blocking I/O, vilket gör det effektivt för nätverksapplikationer.

### Skillnader mot webbläsar-JS
- Ingen DOM
- Moduler (CommonJS och ES-moduler)
- Inbyggda moduler (fs, http, path, etc.)

---

## npm och pakethantering

- **npm** är Node.js inbyggda pakethanterare.
- **package.json** beskriver projektet, beroenden och scripts.
- **nodemon** används för automatisk omstart under utveckling:
  ```bash
  npm install --save-dev nodemon
  ```
- **node_modules** ska alltid ignoreras i .gitignore.

---

## Express – webbramverk för Node.js

Express förenklar skapandet av webbservrar och API:er. Det bygger på Node.js http-modul och erbjuder ett smidigt API för routing, middleware och hantering av requests/responses.

### Exempel: Enkel Express-server
```js
const express = require('express');
const app = express();
const port = 3000;
app.get('/', (req, res) => {
  res.send('Hej från min server!');
});
app.listen(port, () => {
  console.log(`Servern lyssnar på http://localhost:${port}`);
});
```

---

## Routing och API-endpoints

Routing definierar hur servern svarar på olika HTTP-anrop:

```js
const express = require('express');
const app = express();
app.use(express.json());
const books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin' },
  { id: 2, title: 'You Don\'t Know JS', author: 'Kyle Simpson' },
];
app.get('/books', (req, res) => {
  res.json(books);
});
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ message: 'Boken hittades inte' });
  }
  res.json(book);
});
app.post('/books', (req, res) => {
  const { title, author } = req.body;
  const newBook = { id: books.length + 1, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});
app.listen(3000, () => console.log('Servern körs!'));
```

---

## Request och Response-objekten

- **req.params**: URL-parametrar
- **req.query**: Query string-parametrar
- **req.body**: Data i request body (kräver express.json())
- **res.json()**: Skickar JSON-svar
- **res.status()**: Sätter statuskod
- **res.send()**: Skickar svar (sträng, Buffer eller objekt)

> **Viktigt:** Skicka bara ett svar per request! Använd `return` efter felsvar.

---

## Middleware i Express

Middleware är funktioner som kan modifiera req/res eller avsluta/skicka vidare requesten. De registreras med `app.use()` och körs i den ordning de anges.

### Exempel: Egen middleware
```js
function minMiddleware(req, res, next) {
  console.log('Anrop mottaget:', req.method, req.path);
  next();
}
app.use(minMiddleware);
```

### Vanliga middleware
- **express.json()** – Tolkar JSON i request body
- **cors** – Hanterar Cross-Origin Resource Sharing

Felhanteringsmiddleware har fyra parametrar (err, req, res, next) och registreras sist:
```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Något gick fel' });
});
```

---

## REST och stateless API:er

- **REST**: Resursorienterad design, stateless, enhetligt gränssnitt
- **URL-design**: Plural, substantiv, hierarki, versionshantering

Exempel på REST-URL:er:
- `GET /api/v1/books`
- `POST /api/v1/books`
- `GET /api/v1/books/:id`
- `PUT /api/v1/books/:id`
- `PATCH /api/v1/books/:id`
- `DELETE /api/v1/books/:id`

---

## Projektstruktur (exempel)

```
mitt-api/
  src/
    routes/
      books.js
      users.js
    controllers/
      booksController.js
    middleware/
      auth.js
    models/
      Book.js
    app.js
    server.js
  .env
  .gitignore
  package.json
```

- **app.js**: Express-applikationen
- **server.js**: Startar servern
- **routes/**: Route-definitioner
- **controllers/**: Route handler-logik
- **middleware/**: Egna middleware
- **models/**: Datamodeller

---

## Verktyg för API-testning

- **Thunder Client** (VS Code-tillägg): Snabb testning av API:er direkt i editorn
- **Postman**: Branschstandard för API-testning och dokumentation

---

## Checklista inför kursstart

- Node.js installerat (`node --version`, minst v18)
- npm fungerar (`npm --version`)
- Reflektera: Hur skiljer sig backend från frontend? Vilka utmaningar ser du med API-design?

---

## Sammanfattning

Veckan ger dig grunderna i backendutveckling: klient-server-modellen, HTTP-metoder och statuskoder, Node.js och Express, routing, middleware och REST-principer. Du har satt upp din första Express-server och förstått vikten av rätt projektstruktur och API-design.

---

## Rekommenderade resurser

- [Node.js officiell dokumentation](https://nodejs.org/en/docs)
- [Express officiell dokumentation](https://expressjs.com)
- [MDN Web Docs: HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [The Odin Project – NodeJS](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs)
- [Node.js Best Practices (GitHub)](https://github.com/goldbergyoni/nodebestpractices)
- [Node.js Crash Course – Traversy Media (YouTube)](https://www.youtube.com/watch?v=fBNz5xF-Kx4)
- [REST API Design Best Practices – freeCodeCamp (YouTube)](https://www.youtube.com/watch?v=GZvSYJDk-us)
