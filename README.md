# RecipeRiot 🍳 – *Receptdelning med en social twist*

> "Som GitHub, fast för mat."

RecipeRiot är en social och interaktiv fullstack receptplattform inspirerad av GitHub — fast för mat. Kärntanken är att recept inte är statiska dokument, utan levande skapelser som utvecklas, "forkas" och förbättras av en gemenskap av matälskare. Systemet erbjuder även veckoplanering av måltider med en interaktiv inköpslista baserad på valda recept.

Projektet är utvecklat som en del av utbildningen till Fullstackutvecklare JavaScript vid **Chas Academy** (Kurs 4: Node.js, Databaser & Säkerhet).

---

## ✨ Kärnfunktioner

* 🍴 **Fork-funktion & Versionshistorik:** Alla användare kan kopiera vilket recept som helst till sin egen profil och göra sina egna anpassningar (ändra proportioner, byta ingredienser). Länken till originalreceptet bevaras alltid i databasen, vilket gör att man kan följa hur ett recept har utvecklats från original till alla dess forkade varianter.

* 📅 **Veckoplanering:** Planera veckans måltider enkelt genom att klicka på en veckodag och välja bland dina sparade recept eller favoriter.

* 🛒 **Smart & Interaktiv Inköpslista:** Systemet sammanställer automatiskt ingredienserna från veckans valda recept i en interaktiv checklista där du kan bocka i vad du behöver. Listan kan skräddarsys genom att man manuellt lägger till helt egna ingredienser, mängder och enheter.

* 🔍 **Dynamiskt Utforskarflöde:** Ett publikt flöde där användare kan upptäcka nya recept i realtid. Flödet är paginerat och fullt filtrerbart på sökord, taggar, svårighetsgrad (*Lätt, Medel, Svår*) och allergier.

* 🔒 **Säker autentisering & RBAC:** Inloggning och registrering där lösenord hashas med `bcrypt`. Systemet tillämpar rollbaserad behörighetskontroll (RBAC) med en skyddad Admin-vy för hantering av användarkonton.

* 🛡️ **GDPR & Dataskydd:** Full kontroll över personuppgifter genom inbyggda funktioner för dataportabilitet (export av användardata) samt stöd för både mjuk radering (användaren döljs) och hård radering ("rätten att bli gömd").

---

## 🛠 Teknisk Stack

### Backend
* **Runtime & Språk:** Node.js med TypeScript
* **Ramverk:** Express.js
* **Databas:** MongoDB med Mongoose ODM
* **Validering:** Zod-scheman för all inkommande request-data
* **Säkerhet:** Autentisering via JWT (JSON Web Tokens) & lösenordshashning med `bcrypt`
* **Testning:** Integrationstester med Jest & Supertest
* **Loggning:** Strukturerad JSON-loggning via Pino
* **Hosting:** Render (API) & MongoDB Atlas (Databas)

### Frontend
* **Ramverk & Språk:** React (Vite) med TypeScript
* **Routing:** React Router DOM (med Layouts och skyddade routes)
* **Styling:** Vanlig CSS (komponentbaserad) samt CSS Modules (för isolerad styling)
* **Ikoner:** Lucide React

---

## 📂 Projekt- & Mappstruktur

Projektet är uppdelat i en tydlig monorepo-struktur där både backend (affärslogik och databaslager) och frontend (gränssnitt och tillstånd) är strikt separerade och modulärt uppbyggda.

```text
├── backend/            # Backend-applikation (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/     # Konfigurationsfiler (databasanslutning, miljövariabler)
│   │   ├── controllers/# Hanterar logik och koordinering för API-anrop
│   │   ├── errors/     # Centraliserad felhantering och anpassade AppError-klasser
│   │   ├── middlewares/# Autentisering, RBAC, validering, logging och felhantering
│   │   ├── models/     # Mongoose-scheman och datamodeller (User, Recipe etc.)
│   │   ├── routes/     # API-endpoints och routing-konfiguration
│   │   ├── schemas/    # Zod-valideringsscheman för inkommande data
│   │   ├── types/      # Globala TypeScript-definitioner och Express-typutökningar
│   │   ├── app.ts      # Express-applikationens inställningar och routing-prefix
│   │   └── server.ts   # Applikationens startpunkt och databasanslutning
│   └── tests/          # Integrationstester (Jest + Supertest)
│
├── frontend/           # Frontend-applikation (React + Vite + TypeScript)
│   ├── src/
│   │   ├── api/        # API-klienter för asynkrona fetch-anrop (auth, recipes, favorites)
│   │   ├── components/ # Återanvändbara gränssnittskomponenter och sektioner
│   │   │   ├── AddRecipeForm/  # Logik och formulär för att skapa/redigera recept
│   │   │   ├── explorePage/    # Utforskarflöde med sök- och filtreringslogik
│   │   │   ├── features/       # Sektion som presenterar appens huvudfunktioner
│   │   │   ├── footer/         # Sidfot med navigering och externa länkar
│   │   │   ├── hero/           # Välkomstskärm med säljande pitch och call-to-actions
│   │   │   ├── howitworks/     # Pedagogisk steg-för-steg-guide (01-04) för plattformen
│   │   │   ├── layout/         # Applikationsskal; koordinerar global auth-status och vyer
│   │   │   ├── navbar/         # Huvudnavigation med sökfunktion, anpassad efter login-status och roll
│   │   │   ├── recipeCard/     # Receptkort för flöden (hanterar även favorit-hjärtat)
│   │   │   ├── recipeGrid/     # Trendande rutnät på startsidan med smart 'refreshTrigger'-omladdning
│   │   │   ├── recipeModal/    # Detaljerad receptvy med flikar samt det komplexa fork-läget
│   │   │   ├── shoppinglist/   # Inköpslista stylad med CSS Modules (synkad mot localStorage)
│   │   │   ├── userLogin/      # Två-i-ett-modal för inloggning och registrering med validering
│   │   │   ├── weeklyplanner/  # Veckomenyhanterare med localStorage-synk
│   │   │   └── pages/          # Fullständiga sidvyer och routade komponenter
│   │   │       ├── aboutPage.tsx    # "Om oss"-sida som beskriver RecipeRiots mission och vision
│   │   │       ├── adminPage.tsx    # Skyddad administrationsvy för admin-användare
│   │   │       ├── contactPage.tsx  # Kontaktsida med fungerande e-postformulär
│   │   │       ├── Home.tsx         # Landningssida som orkestrerar Hero, Grid, Features och HowItWorks
│   │   │       ├── InfoPages.css    # Gemensam styling för About, Contact och Privacy
│   │   │       ├── privacyPage.tsx  # Integritetspolicy (GDPR-information och datahantering)
│   │   │       ├── profilePage.css  # Styling för profilsidan och dess fliksystem
│   │   │       └── profilePage.tsx  # Användarprofil (Mina recept, Favoriter och Inställningar)
│   │   ├── App.tsx     # Huvudkomponent och router-konfiguration
│   │   ├── main.tsx    # Applikationens startpunkt och DOM-rendering
│   │   └── types.ts    # Globala TypeScript-typer och gränssnitt (t.ex. Recipe)
```

---

## ⚙️ Miljövariabler (.env)

Projektet kräver en .env-fil i rotmappen för backend för att kunna starta. Pusha aldrig denna fil till GitHub! Använd följande struktur (en mall finns även i .env.example):

```env
# Serverkonfiguration
PORT=3000
NODE_ENV=development

# Databasanslutning
MONGO_URI=mongodb+skydda-din-databas-strang-har

# Säkerhet & Autentisering
JWT_SECRET=byt_ut_detta_till_en_saker_hemlighet_i_produktion
JWT_EXPIRES_IN=7d

# Klientanslutning (CORS)
CORS_ORIGIN=http://localhost:5173
```

---

## 🔌 API Endpoints (RESTful)

Vårt API är versionshanterat (`v1`) och följer strikta REST-konventioner. Nedan visas de endpoints som finns tillgängliga i systemet:

### Autentisering (`/api/v1/auth`)
* `POST /api/v1/auth/register` – Registrera ny användare (Lösenord hashas med bcrypt).
* `POST /api/v1/auth/login` – Logga in och erhåll en JWT-token.
* `GET /api/v1/auth/me` *(Användare)* – Hämtar den inloggade användarens profil.
* `GET /api/v1/auth/admin` *(Admin)* – Kontrollerar om den inloggade användaren är administratör.

### Favoriter (`/api/v1/favorites`)
* `GET /api/v1/favorites` *(Användare)* – Hämta alla dina sparade favoritrecept.
* `POST /api/v1/favorites/:recipeId` *(Användare)* – Lägg till ett recept i dina favoriter (används sedan i veckoplaneringen).
* `DELETE /api/v1/favorites/:recipeId` *(Användare/Ägare)* – Ta bort ett recept från dina favoriter.

### Recept & Fork-system (`/api/v1/recipes`)
* `GET /api/v1/recipes` – Hämta alla publicerade recept i utforskarflödet (Paginerat. Stöder filtrering via query-parameters baserat på sökord, taggar, svårighetsgrad och allergier).
* `GET /api/v1/recipes/:id` – Hämta ett specifikt recept med alla dess ingredienser och instruktioner.
* `POST /api/v1/recipes` *(Användare)* – Skapa och publicera ett nytt recept.
* `PATCH /api/v1/recipes/:id` *(Användare/Ägare)* – Uppdatera delar av ett eget recept.
* `DELETE /api/v1/recipes/:id` *(Användare/Ägare/Admin)* – Radera ett recept (mjuk radering).
* `POST /api/v1/recipes/:id/fork` *(Användare)* – Forka (kopiera) någon annans recept till din egen profil för att göra justeringar. Det nya receptet länkas automatiskt till originalet i databasen.

### GDPR & Dataskydd (`/api/v1/gdpr`)
* `GET /api/v1/gdpr/export` *(Användare)* – Exportera all data som finns sparad om den inloggade användaren (GDPR Dataportabilitet).
* `DELETE /api/v1/gdpr/me` *(Användare)* – Mjuk radering (Soft delete). Döljer profilen och sätter `deletedAt` i databasen.
* `DELETE /api/v1/gdpr/me/hard` *(Användare)* – Hård radering (Hard delete). Raderar användarens personuppgifter permanent från databasen ("Rätten att bli glömd").

### Administration (`/api/v1/users`)
* `GET /api/v1/users` *(Admin)* – Lista alla registrerade användare i systemet (Paginerat med stöd för sökning).
* `GET /api/v1/users/:id` *(Admin)* – Hämta detaljerad profilinformation om en specifik användare via ID.
* `POST /api/v1/users` *(Admin)* – Skapa en ny användare direkt via administrationspanelen.
* `PUT /api/v1/users/:id` *(Admin)* – Uppdatera informationen på en specifik användares profil (alla fält valfria).
* `DELETE /api/v1/users/:id` *(Admin)* – Radera en användare permanent från systemet.

---

## 🚀 Installation & Kom igång lokalt

### Förutsättningar

För att köra detta projekt lokalt behöver du ha följande installerat:

* [Node.js](https://nodejs.org/) (LTS-version rekommenderas)
* Ett konto på [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) eller en lokal installation av MongoDB.

### Installation steg-för-steg

Följ dessa steg för att sätta upp projektet lokalt på under 10 minuter:

1. **Klona repot:**

   ```bash
   git clone https://github.com/zaida-wiss/RecipeRiot.git
   cd RecipeRiot
   ```

2. **Installera globala beroenden:**

   ```bash
   npm install
   ```

3. **Sätt upp Backend:**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

   Konfigurera dina miljövariabler i den nyskapade `.env`-filen och starta sedan backend-servern:

   ```bash
   npm run dev
   ```

4. **Sätt upp Frontend:**

   Öppna ett nytt terminalfönster i projektets rotmapp och kör:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Öppna applikationen:**

   Frontend kommer normalt att vara tillgänglig på:

   ```text
   http://localhost:5173
   ```

   Backend-API:t körs normalt på:

   ```text
   http://localhost:5000
   ```