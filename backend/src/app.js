
// Importerar Express-biblioteket för att skapa en webbserver.
const express = require('express');
// Importerar routern som innehåller alla recept-endpoints.
const recipesRouter = require('./routes/recipe');
// Importerar loggermiddleware som loggar alla inkommande requests.
const logger = require('./middleware/logger');

// Skapar en ny Express-applikation.
const app = express();
// Middleware som tolkar inkommande JSON-data från request body.
app.use(express.json());
// Middleware som loggar HTTP-metod och sökväg för varje request.
app.use(logger);
// Kopplar receptrouterna till /recipes-vägen, t.ex. /recipes, /recipes/1.
app.use('/recipes', recipesRouter);

// Exporterar appen så server.js kan starta den.
module.exports = app;