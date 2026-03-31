# Backendutveckling i Node.js, databaser och säkerhet – Kursvecka 4

## Studiematerial: MongoDB och Mongoose – grunder

### Introduktion
Under de tre första veckorna har vi byggt upp en solid grund i backendutveckling: vi kan skapa Express-servrar med välstrukturerade routes och middleware, vi förstår HTTP och REST API-design, och vi kan nu skriva vår backendkod med TypeScript för ökad typsäkerhet. Men vi har saknat en kritisk komponent – persistent datalagring. Alla data vi hittills arbetat med har förvarats i minnet och försvunnit varje gång servern startats om. Det är dags att ta nästa steg och koppla vår server till en riktig databas.

Den här veckan introducerar vi MongoDB – en dokumentbaserad databas – och Mongoose, som är det mest använda biblioteket för att kommunicera med MongoDB från Node.js. Det är ett stort och viktigt steg: när vi kombinerar Express med MongoDB har vi alla delar på plats för att bygga riktiga fullstackapplikationer som faktiskt kan lagra och hämta data på ett varaktigt sätt.

Innan vi dyker in i MongoDB är det viktigt att förstå varför vi behöver en databas över huvud taget, och varför vi väljer en dokumentdatabas framför en relationsdatabas. Vi ska titta på de grundläggande skillnaderna, förstå när varje typ passar bäst, och sedan lägga all vår energi på att lära oss MongoDB och Mongoose i praktiken.

Vi avslutar veckan med att veta hur man ansluter en Express-applikation till MongoDB Atlas (Mongodbrs molntjänst), skapar schemas och modeller med Mongoose och TypeScript, och utför de grundläggande databasoperationerna – att spara och hämta dokument. Nästa vecka bygger vi vidare med fullständiga CRUD-operationer och relationer.

---

## Varför behöver vi persistent datalagring?
En applikation utan persistent datalagring är fundamentalt begränsad. Tänk på vad som händer med vår Express-server just nu: när vi startar den kan vi skapa, uppdatera och ta bort data i en JavaScript-array i minnet. Men så fort servern startas om – antingen för att vi gjort en kodändring, för att det uppstår ett fel, eller för att vi driftsätter en ny version – är all data borta. Alla användare som registrerat sig, alla inlägg som skapats, alla beställningar som gjorts: allt försvinner.

För en verklig applikation är det självklart oacceptabelt. Men persistent datalagring ger oss mer än bara beständighet. Det ger oss möjligheten att hantera data som är mycket större än vad som ryms i minnet, att söka och filtrera data effektivt med index, att köra flera instanser av vår server parallellt (alla kopplade till samma databas), och att överleva serveromstarter och driftsättningar utan dataförlust.

En databas är ett system optimerat för att lagra, organisera och hämta data. Till skillnad från en vanlig fil erbjuder en databas strukturerade sätt att söka och filtrera data, transaktionsstöd, index för snabba sökningar, och mekanismer för att hantera flera läsare och skrivare samtidigt utan att data korrumperas.

Det finns många typer av databaser, men i webbutvecklingsvärlden dominerar två kategorier: relationsdatabaser (SQL) och dokumentdatabaser (NoSQL). Vi ska förstå skillnaderna för att kunna välja rätt verktyg för rätt uppgift.

---

## Relationsdatabaser vs dokumentdatabaser
### Relationsdatabaser (SQL)
- Organiserar data i tabeller med rader och kolumner
- Strikt schema
- SQL (Structured Query Language)
- ACID-transaktioner
- Normalisering

Passar för komplex, väldefinierad datastruktur och starka konsistenskrav.

### Dokumentdatabaser (NoSQL)
- Lagrar data i dokument (JSON/BSON)
- Flexibelt schema
- Inbäddning av relaterad data
- Horisontell skalning
- Naturlig mappning till JavaScript

Passar för varierande datastrukturer, snabb iteration och dokumentliknande data.

### Varför MongoDB i den här kursen?
- Populäraste dokumentdatabasen
- Naturlig mappning till JavaScript-objekt
- Mongoose ger struktur och validering ovanpå MongoDB:s flexibilitet

---

## MongoDB – dokumentbaserad datalagring
- **Databas**: logisk behållare för samlingar
- **Samling (Collection)**: motsvarar tabell i SQL
- **Dokument**: motsvarar rad i SQL, JSON-liknande objekt
- **Fält**: motsvarar kolumn i SQL

Exempel på dokument:
```json
{
  "_id": "ObjectId('64a3f2c1b5e8f123456789ab')",
  "name": "Anna Svensson",
  "email": "anna@example.com",
  "age": 28,
  "address": {
    "street": "Storgatan 12",
    "city": "Stockholm",
    "postalCode": "111 22"
  },
  "hobbies": ["programmering", "löpning", "matlagning"],
  "createdAt": "ISODate('2024-07-03T10:30:00.000Z')"
}
```

---

## MongoDB Atlas – vår molnbaserade databas
1. Skapa konto på mongodb.com/atlas
2. Skapa projekt och gratis M0-kluster
3. Skapa databasanvändare
4. Konfigurera nätverksåtkomst
5. Hämta anslutningssträng

Hantera anslutningssträngen säkert med miljövariabler och dotenv.

---

## Miljövariabler och dotenv
Installera dotenv:
```bash
npm install dotenv
```

Exempel på .env-fil:
```
PORT=3000
MONGODB_URI=mongodb+srv://[användarnamn]:[lösenord]@cluster0.xxxxx.mongodb.net/[databas]
NODE_ENV=development
```

Lägg till .env i .gitignore!

Läs in miljövariabler i server.js:
```js
require('dotenv').config();
const app = require('./app');
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI saknas i miljövariablerna!');
  process.exit(1);
}
app.listen(PORT, () => {
  console.log(`Servern lyssnar på port ${PORT}`);
});
```

Skapa gärna en .env.example-fil för dokumentation.

---

## Mongoose – Object Document Mapper
Installera Mongoose:
```bash
npm install mongoose
```

Exempel på databasanslutning:
```js
// src/config/database.js
const mongoose = require('mongoose');
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Ansluten till MongoDB');
  } catch (error) {
    console.error('Kunde inte ansluta till MongoDB:', error.message);
    process.exit(1);
  }
}
module.exports = { connectToDatabase };
```

---

## Schemas och modeller med Mongoose och TypeScript
Exempel på bokmodell:
```ts
// src/models/Book.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
export interface IBook extends Document {
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  isbn?: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const BookSchema = new Schema<IBook>({
  title: { type: String, required: [true, 'Titel är obligatorisk'], trim: true, maxlength: [200, 'Titeln får inte vara längre än 200 tecken'] },
  author: { type: String, required: [true, 'Författare är obligatorisk'], trim: true },
  genre: { type: String, required: [true, 'Genre är obligatorisk'], enum: { values: ['fiction', 'non-fiction', 'science', 'history', 'biography'], message: '{VALUE} är inte en giltig genre' } },
  publishedYear: { type: Number, required: [true, 'Utgivningsår är obligatoriskt'], min: [1000, 'Utgivningsår måste vara minst 1000'], max: [new Date().getFullYear(), 'Utgivningsår kan inte vara i framtiden'] },
  isbn: { type: String, unique: true, sparse: true },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });
export const Book: Model<IBook> = mongoose.model<IBook>('Book', BookSchema);
```

---

## Grundläggande databasoperationer
### Skapa ett dokument
```js
const savedBook = await Book.create({
  title: 'Clean Code',
  author: 'Robert C. Martin',
  genre: 'non-fiction',
  publishedYear: 2008,
});
```

### Läsa dokument
```js
const books = await Book.find();
const fictionBooks = await Book.find({ genre: 'fiction' });
const titlesOnly = await Book.find({}, 'title author -_id');
const book = await Book.findById(req.params.id);
const book = await Book.findOne({ isbn: '978-0-13-468599-1' });
```

### Hantera null-resultat
```js
const book = await Book.findById(req.params.id);
if (!book) {
  return res.status(404).json({ message: 'Boken hittades inte' });
}
res.json(book);
```

---

## Rekommenderad projektstruktur
```
mitt-api/
  src/
    config/
      database.js
    models/
      Book.ts
      User.ts
    routes/
      books.js
      users.js
    middleware/
      errorHandler.js
    app.js
    server.js
  .env
  .env.example
  .gitignore
  package.json
  tsconfig.json
```

---

## Vanliga misstag och hur vi undviker dem
- Glömma await på asynkrona operationer
- Inte hantera null-resultat från findById/findOne
- Committa .env till Git (lägg alltid till i .gitignore!)

Om du råkat committa känslig information: byt lösenord/nycklar och städa Git-historiken.

---

## Checkpoint: Förberedelse inför kursvecka 4
- Skapat konto på MongoDB Atlas och gratis M0-kluster
- Skapat databasanvändare och konfigurerat nätverksåtkomst
- Lagt in anslutningssträngen i .env
- Installerat mongoose och dotenv och verifierat anslutningen

Reflektera: När är en dokumentdatabas ett bättre val än en relationsdatabas? Vad är fördelen med att definiera ett Mongoose-schema när MongoDB i sig är schemafritt? Hur ser TypeScript-interfacet och Mongoose-schemat på varandra – varför behöver vi båda?

---

## Sammanfattning
Under kursvecka 4 har vi tagit det avgörande steget att koppla vår Express-backend till en riktig databas. Vi förstår nu varför persistent datalagring är nödvändig – in-memory-lösningar förlorar all data vid omstart och kan inte hantera data som är större än tillgängligt RAM-minne.

Vi har granskat de grundläggande skillnaderna mellan relationsdatabaser och dokumentdatabaser. Relationsdatabaser organiserar data i tabeller med strikta schemas och används via SQL – de är utmärkta för komplex, väldefinierad data med starka konsistenskrav. Dokumentdatabaser som MongoDB lagrar data som JSON-liknande dokument i samlingar, erbjuder flexibla schemas och passar bra för snabb iteration och data som naturligt representeras som dokument. Inget av dem är objektivt bättre – valet beror på kravbilden.

MongoDB Atlas ger oss en molnbaserad MongoDB-instans utan att vi behöver installera och konfigurera en databasserver lokalt. Gratisnivån är mer än tillräcklig för utbildningens projekt, och Atlas används också brett i produktion. Nyckeln till att ansluta vår applikation till Atlas är anslutningssträngen, som vi hanterar säkert via miljövariabler med dotenv – vi committar aldrig .env-filen till Git.

Mongoose är vår brygga till MongoDB. Som ODM ger det oss schemas för att definiera dokumentstrukturen, validering för att säkerställa datakvaliteten, och ett expressivt query-API. Vi kombinerar Mongoose schemas med TypeScript-interfaces för dubbel typsäkerhet: TypeScript fångar typfel vid kompilering och Mongoose fångar valideringsfel vid körning. En Mongoose-modell skapas från ett schema och är det objekt vi använder i vår applikationskod för alla databasoperationer.

Vi har sett hur man skapar dokument med Book.create() och hämtar dokument med Book.find() och Book.findById(). Alla operationer är asynkrona och vi använder async/await med try/catch och next(error) för att hantera fel korrekt. Vi kontrollerar alltid för null-resultat från findById() och findOne() och returnerar ett 404-svar om dokumentet inte finns.

Nästa vecka fördjupar vi oss i CRUD-operationer – vi lägger till uppdatering och borttagning, lär oss filtrera, sortera och paginera sökresultat, och börjar utforska relationer mellan dokument. Vi introducerar också testning av API:er mot en testdatabas. Boiler room-projektet ska nu börja använda en riktig databas – mer information i BoilerRoomProjekt.pdf.

---

## Resurser för fördjupning
- [MongoDB officiella dokumentation](https://www.mongodb.com/docs/)
- [Mongoose officiella dokumentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas dokumentation](https://www.mongodb.com/docs/atlas/getting-started/)
- [dotenv dokumentation](https://github.com/motdotla/dotenv)
- [MongoDB University](https://learn.mongodb.com/)
- [Mongoose Crash Course – Traversy Media (YouTube)](https://www.youtube.com/watch?v=DZBGEVgL2eE)
- [The Twelve-Factor App](https://12factor.net/config)
- [GitGuardian guide om hemligheter i Git](https://blog.gitguardian.com/secrets-credentials-api-git/)
