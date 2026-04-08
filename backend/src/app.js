
// Importerar Express-biblioteket för att skapa en webbserver.
const express = require('express');
// Importerar routern som innehåller alla recept-endpoints.
const recipesRouter = require('./routes/recipe');
// Importerar loggermiddleware som loggar alla inkommande requests.
const logger = require('./middleware/logger');
// Importerar CORS-middleware så att klienter från andra origin kan anropa API:t.
const cors = require('cors');
// Importerar Morgan för tydlig HTTP-loggning i terminalen.
const morgan = require('morgan');

// Skapar en ny Express-applikation.
const app = express();
// Aktiverar CORS innan routes så att externa klienter får göra requests.
app.use(cors());
// Middleware som tolkar inkommande JSON-data från request body.
app.use(express.json());
// Morgan loggar varje request med formatet dev.
app.use(morgan('dev'));
// Middleware som loggar HTTP-metod och sökväg för varje request.
app.use(logger);
// Kopplar receptrouterna till /recipes-vägen, t.ex. /api/v1/recipes.
app.use('/api/v1/recipes', recipesRouter);

// Exporterar appen så server.js kan starta den.
module.exports = app;