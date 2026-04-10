// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const recipesRouter = require('./routes/recipes');
const usersRouter = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health-kontroll
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/users', usersRouter);

// 404 - om ingen route matchar
app.use((req, res) => {
  res.status(404).json({ message: 'Sidan finns inte' });
});

module.exports = app;
