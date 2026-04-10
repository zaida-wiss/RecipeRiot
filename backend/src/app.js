
const express = require('express');
const recipesRouter = require('./routes/recipe');
const logger = require('./middleware/logger');

const app = express();
app.use(express.json());
app.use(logger);
app.use('/recipes', recipesRouter);

module.exports = app;