// Deklaration
import express from 'express';

import cors from 'cors';
import morgan from 'morgan';

const app = express();

const recipesRouter = require('./routes/recipes');
const usersRouter = require('./routes/users');
const logger = require('./middleware/logger');


// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);

// Health-kontroll: Bekräftar att servern lever och kan ta emot requests
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/users', usersRouter);

// 404 - om ingen route matchar
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Sidan finns inte' });
});

export default app;