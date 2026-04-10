# RecipeRiot — Backend

Vecka 1 av 12 | Backendutveckling i Node.js

## Starta projektet

```bash
npm install
npm run dev
```

Servern startar på http://localhost:3000

## Testa att det fungerar

Öppna Postman eller Thunder Client och gör ett GET-anrop till:

```
GET http://localhost:3000/health
```

Du ska få tillbaka:
```json
{ "status": "ok" }
```

## Mappstruktur

```
src/
├── app.js              ← Express-appen, middleware och routes
├── server.js           ← Startar servern
├── routes/
│   ├── users.js        ← Routes för /api/v1/users
│   └── recipes.js      ← Routes för /api/v1/recipes
├── controllers/        ← Tom nu, fylls i vecka 2
└── middleware/         ← Tom nu, fylls i vecka 2
```

## Endpoints just nu

| Metod | URL | Svar |
|-------|-----|------|
| GET | /health | `{ "status": "ok" }` |
| GET | /api/v1/recipes | placeholder-svar |
| GET | /api/v1/recipes/:id | placeholder-svar |
| POST | /api/v1/recipes | placeholder-svar |
| PUT | /api/v1/recipes/:id | placeholder-svar |
| DELETE | /api/v1/recipes/:id | placeholder-svar |
| GET | /api/v1/users | placeholder-svar |
| GET | /api/v1/users/:id | placeholder-svar |
| POST | /api/v1/users | placeholder-svar |
| PUT | /api/v1/users/:id | placeholder-svar |
| DELETE | /api/v1/users/:id | placeholder-svar |

## Nästa vecka (V2)

- Flytta logiken från routes till controllers
- Lägga till riktig data (utan databas ännu)
- Returnera riktiga statuskoder
