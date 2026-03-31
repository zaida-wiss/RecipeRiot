# Backendutveckling i Node.js, databaser och säkerhet – Kursvecka 5

## Studiematerial: CRUD-operationer, relationer och testning

### Introduktion
Under vecka 4 lade vi grunden för databasarbete: vi satte upp MongoDB Atlas, lärde oss vad Mongoose är och varför vi använder det, definierade våra första schemas och modeller, och anslöt vår Express-server till databasen. Vi genomförde även de allra enklaste databasoperationerna – att skapa och hämta dokument. Nu tar vi det steget vidare och bygger ut vår förståelse till att täcka hela CRUD-spektrumet.

CRUD är en akronym för Create, Read, Update och Delete – de fyra grundläggande operationerna som nästan all databasinteraktion kan reduceras till. Att behärska fullständiga CRUD-operationer är kärnan i backendutveckling: det är det vi gör när vi bygger ett API som en frontend kan kommunicera med. Under den här veckan lär vi oss inte bara hur man implementerar dessa operationer, utan också hur man gör det på ett strukturerat och testbart sätt.

En viktig ny dimension som vi introducerar den här veckan är relationer. Verkliga applikationer har sällan en enda typ av data – de har användare som skriver inlägg, produkter som tillhör kategorier, beställningar som kopplas till kunder. MongoDB hanterar relationer annorlunda än relationsdatabaser, och det är viktigt att vi förstår de avvägningar som finns. Vi utforskar de två huvudstrategierna – embedding och referencing – och lär oss när man ska välja vad.

Den andra stora nyheten den här veckan är testning. Att bygga ett API som fungerar är en sak; att kunna bevisa att det fungerar – och fortsätter fungera – är en annan. Vi introducerar Jest och Supertest, som tillsammans ger oss ett kraftfullt verktyg för att skriva automatiserade tester för våra Express-routes och Mongoose-operationer. Tester är inte ett lyxprojekt – de är ett professionellt verktyg som skyddar oss mot regressioner och ger oss trygghet att refaktorera kod.

Det är en innehållsrik vecka, men allt hänger ihop: fullständig CRUD ger oss operationerna, relationer ger oss datamodellen, och testning ger oss verifieringen. Tillsammans bildar de en solid grund för det professionella API-bygget som vi arbetar mot under resten av kursen.

---

## Fullständiga CRUD-operationer med Mongoose
Mongoose erbjuder ett rikt API för att interagera med MongoDB. Vi arbetar med metoder direkt på modellen (`Model.find()`, `Model.findById()` osv.) och på enskilda dokument-instanser (`document.save()`, `document.deleteOne()`). Det är viktigt att vi förstår skillnaden: statiska metoder på modellen används för att söka och hämta, medan instansmetoder används för att manipulera ett specifikt dokument vi redan hämtat.

### Skapa dokument – Create
```js
// Metod 1: new + save
const book = new Book({
  title: 'The Pragmatic Programmer',
  author: 'David Thomas',
  genre: 'technology',
  year: 1999
});
await book.save();
// Metod 2: Model.create() - kortare och skapar direkt
const book = await Book.create({
  title: 'The Pragmatic Programmer',
  author: 'David Thomas',
  genre: 'technology',
  year: 1999
});
// Skapa flera dokument på en gång
const books = await Book.insertMany([
  { title: 'Clean Code', author: 'Robert C. Martin', year: 2008 },
  { title: 'Refactoring', author: 'Martin Fowler', year: 1999 }
]);
```

### Läsa dokument – Read
```js
// Hämta alla dokument
const allBooks = await Book.find();
// Hämta med filter (query-objekt)
const techBooks = await Book.find({ genre: 'technology' });
// Hämta ett enskilt dokument med _id
const book = await Book.findById('64a3c1f2e8b4a12345678901');
// Hämta ett dokument baserat på valfritt fält
const book = await Book.findOne({ title: 'Clean Code' });
// Välj specifika fält (projection)
const books = await Book.find({}, { title: 1, author: 1, _id: 0 });
```

### Uppdatera dokument – Update
```js
// Metod 1: Hämta, modifiera, spara
const book = await Book.findById(id);
if (!book) return res.status(404).json({ message: 'Boken hittades inte' });
book.title = req.body.title;
book.author = req.body.author;
await book.save();
// Metod 2: findByIdAndUpdate
const book = await Book.findByIdAndUpdate(
  id,
  { $set: { title: req.body.title } },
  { new: true, runValidators: true }
);
// updateOne
await Book.updateOne({ _id: id }, { $set: { year: 2024 } });
```

### Radera dokument – Delete
```js
// findByIdAndDelete
const book = await Book.findByIdAndDelete(id);
if (!book) return res.status(404).json({ message: 'Boken hittades inte' });
// deleteOne
const result = await Book.deleteOne({ _id: id });
// deleteMany
await Book.deleteMany({ genre: 'outdated' });
```

---

## Sätta ihop en fullständig CRUD-router
```js
// routes/books.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
// GET /books - Hämta alla böcker
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Serverfel' });
  }
});
// GET /books/:id - Hämta en specifik bok
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Boken hittades inte' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Serverfel' });
  }
});
// POST /books - Skapa en ny bok
router.post('/', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// PUT /books/:id - Uppdatera en bok
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: 'Boken hittades inte' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// DELETE /books/:id - Radera en bok
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Boken hittades inte' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Serverfel' });
  }
});
module.exports = router;
```

---

## Filtrera, sortera och paginera data
### Filtrera med queries
```js
const books = await Book.find({ genre: 'technology' });
const modernBooks = await Book.find({ year: { $gte: 2000 } });
const books = await Book.find({ genre: { $in: ['technology', 'fiction'] } });
const books = await Book.find({ title: { $regex: req.query.search, $options: 'i' } });
const books = await Book.find({ genre: 'technology', year: { $gte: 2010 } });
const books = await Book.find({ $or: [ { author: 'Robert C. Martin' }, { author: 'Martin Fowler' } ] });
```

### Sortering
```js
const books = await Book.find().sort({ title: 1 });
const books = await Book.find().sort({ year: -1 });
const books = await Book.find().sort({ genre: 1, year: -1 });
// Dynamisk sortering
const sortField = req.query.sort || 'createdAt';
const sortOrder = req.query.order === 'desc' ? -1 : 1;
const books = await Book.find().sort({ [sortField]: sortOrder });
```

### Paginering
```js
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;
const [books, total] = await Promise.all([
  Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
  Book.countDocuments()
]);
res.json({
  data: books,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  }
});
```

---

## Relationer i MongoDB: Embedding vs Referencing
### Embedding
```js
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  comments: [
    {
      text: String,
      author: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
});
```

### Referencing
```js
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: String,
  year: Number,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: true
  }
});
const authorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nationality: String,
  birthYear: Number
});
```

### Hybrid
```js
const bookSchema = new mongoose.Schema({
  title: String,
  author: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    name: String
  }
});
```

---

## Populate i Mongoose
```js
const book = await Book.findById(id).populate('author');
const book = await Book.findById(id).populate('author', 'name nationality');
const order = await Order.findById(id)
  .populate('customer', 'name email')
  .populate('products', 'name price');
const post = await Post.findById(id).populate({
  path: 'comments',
  populate: {
    path: 'author',
    select: 'name'
  }
});
const post = await Post.findById(id).populate({
  path: 'comments',
  match: { approved: true },
  select: 'text author createdAt'
});
```

---

## Indexering i MongoDB
```js
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author', index: true },
  genre: String,
  year: Number
});
bookSchema.index({ genre: 1, year: -1 });
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }
});
bookSchema.index({ title: 'text', description: 'text' });
```

### Hantera duplicate key error
```js
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'E-postadressen används redan' });
    }
    res.status(500).json({ message: 'Serverfel' });
  }
});
```

---

## Introduktion till testning av API:er
Testning är en investering som betalar sig snabbt. Vi fokuserar på integrationstester för våra Express-routes, vilket är det mest värdefulla testnivån för en backend.

### Jest och Supertest
Installera:
```bash
npm install --save-dev jest supertest
```

Lägg till i package.json:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

### Grundläggande Jest-syntax
```js
describe('Böcker API', () => {
  test('ska returnera 200 och en array', () => {
    expect(2 + 2).toBe(4);
    expect([1, 2, 3]).toHaveLength(3);
    expect({ name: 'Anna' }).toMatchObject({ name: 'Anna' });
  });
});
```

### Integrationstester med Supertest
```js
const request = require('supertest');
const app = require('../app');
describe('GET /api/v1/books', () => {
  test('ska returnera statuskod 200', async () => {
    const response = await request(app).get('/api/v1/books');
    expect(response.status).toBe(200);
  });
});
```

---

## Testa mot en in-memory-databas
Installera:
```bash
npm install --save-dev mongodb-memory-server
```

Exempel på hjälpfunktioner:
```js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;
async function connect() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}
async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
}
async function disconnect() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}
module.exports = { connect, clearDatabase, disconnect };
```

---

## Projektstruktur för ett testbart API
```
mitt-api/
  src/
    routes/
      books.js
      books.test.js
    controllers/
      booksController.js
    models/
      Book.js
    app.js
    server.js
  __tests__/
    helpers/
      db.js
  jest.config.js
  package.json
```

---

## Checkpoint: Förberedelse inför kursvecka 5
- Projektet från vecka 4 körs utan fel – Express-server ansluten till MongoDB Atlas
- Minst en Mongoose-modell definierad med ett schema
- `npm install --save-dev jest supertest mongodb-memory-server` är klart i projektet
- Test-scriptet är definierat i package.json

Reflektera: Hur hade ni modellerat relationen mellan böcker och författare i en SQL-databas? Vilka skillnader ser ni jämfört med embedding och referencing i MongoDB? Varför tror ni det är viktigt att testa mot en separat testdatabas och inte den riktiga?

---

## Sammanfattning
Under kursvecka 5 har vi tagit MongoDB och Mongoose från grunderna till ett komplett och testbart CRUD-API. Vi har täckt de fyra grundläggande operationerna – Create, Read, Update och Delete – med Mongooses fullständiga metoduppsättning. Vi har lärt oss att filtrera resultat med MongoDB query-operatorer, sortera data och paginera stora datamängder. Vi utforskade de två huvudstrategierna för relationer i MongoDB: embedding och referencing. Populate()-metoden låter oss ersätta ObjectId-referenser med fullständiga dokument. Indexering är ett viktigt prestandaverktyg och unique index är ett dataintegritetsskydd. Slutligen introducerade vi testning med Jest och Supertest samt mongodb-memory-server för isolerad testmiljö.

Nästa vecka fördjupar vi oss i inputvalidering och robust felhantering – de lager av säkerhet som skyddar vår databas och våra API-svar från felaktig och skadlig data.

---

## Resurser
- [Mongoose-dokumentation](https://mongoosejs.com/docs/)
- [MongoDB Query Operators](https://www.mongodb.com/docs/manual/reference/operator/query/)
- [Jest-dokumentation](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/ladjs/supertest)
- [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server)
- [6 Rules of Thumb for MongoDB Schema Design](https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design)
- [Testing Node.js + Mongoose with an in-memory database](https://dev.to/paulasantamaria/testing-node-js-mongoose-with-an-in-memory-database-32np)
- YouTube: "Mongoose Crash Course" av Traversy Media
- YouTube: "Jest Crash Course" av Traversy Media
