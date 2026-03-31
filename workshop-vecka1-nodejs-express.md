# Workshop: Kom igång med Node.js, Express och REST API

Den här workshopen hjälper dig att praktiskt öva på grunderna från kursvecka 1. Du får steg-för-steg-övningar med kodexempel och reflektionsfrågor. Målet är att du ska ha en fungerande Express-server, förstå routing, middleware och REST-principer, samt kunna testa ditt API.

---

## 1. Initiera projektet

1. Skapa en ny mapp för projektet och gå in i den:
   ```bash
   mkdir recipe-workshop
   cd recipe-workshop
   ```
2. Initiera npm och skapa en `.gitignore`:
   ```bash
   npm init -y
   echo node_modules > .gitignore
   ```

---

## 2. Installera Express och nodemon

```bash
npm install express
npm install --save-dev nodemon
```

Lägg till följande i `package.json` under "scripts":
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

---

## 3. Sätt upp projektstruktur

Skapa mappar och filer:
```
src/
  app.js
  server.js
  routes/
    books.js
  controllers/
    booksController.js
  middleware/
    logger.js
```

---

## 4. Skapa en enkel Express-server

**src/app.js**
```js
const express = require('express');
const booksRouter = require('./routes/books');
const logger = require('./middleware/logger');

const app = express();
app.use(express.json());
app.use(logger);
app.use('/books', booksRouter);

module.exports = app;
```

**src/server.js**
```js
const app = require('./app');
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servern lyssnar på http://localhost:${port}`);
});
```

---

## 5. Routing och controllers

**src/routes/books.js**
```js
const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

router.get('/', booksController.getAllBooks);
router.get('/:id', booksController.getBookById);
router.post('/', booksController.createBook);

module.exports = router;
```

**src/controllers/booksController.js**
```js
const books = [
  { id: 1, title: 'Clean Code', author: 'Robert C. Martin' },
  { id: 2, title: 'You Don\'t Know JS', author: 'Kyle Simpson' },
];

exports.getAllBooks = (req, res) => {
  res.json(books);
};

exports.getBookById = (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);
  if (!book) {
    return res.status(404).json({ message: 'Boken hittades inte' });
  }
  res.json(book);
};

exports.createBook = (req, res) => {
  const { title, author } = req.body;
  const newBook = { id: books.length + 1, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
};
```

---

## 6. Middleware

**src/middleware/logger.js**
```js
module.exports = (req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
};
```

---

## 7. Testa ditt API

- Starta servern: `npm run dev`
- Testa endpoints med Thunder Client eller Postman:
  - `GET http://localhost:3000/books`
  - `GET http://localhost:3000/books/1`
  - `POST http://localhost:3000/books` med JSON-body `{ "title": "Eloquent JavaScript", "author": "Marijn Haverbeke" }`

---

## 8. Reflektionsfrågor

- Vad händer om du skickar en POST utan `title` eller `author`?
- Hur kan du förbättra felhanteringen?
- Hur skulle du lägga till en route för att ta bort en bok?
- Hur kan du använda middleware för att logga mer information?

---

## 9. Stretch goals

- Lägg till en DELETE-route för att ta bort en bok
- Lägg till validering av indata i `createBook`
- Skapa en route `/health` som returnerar `{ status: 'ok' }`
- Dela upp kod i fler moduler (t.ex. för users)

---

## 10. Tips

- Skriv kommentarer i koden för att förklara vad som händer
- Testa att ändra och lägga till endpoints
- Läs igenom [Express-dokumentationen](https://expressjs.com)

---

Lycka till med workshopen! Ställ frågor om du kör fast eller vill ha feedback på din kod.
