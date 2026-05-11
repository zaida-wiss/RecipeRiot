import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import recipesRouter from './routes/recipes';
import Router from './routes/recipes';

import logger from './middleware/logger';
import { errorHandler } from './errors/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/users', Router);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Sidan finns inte' },
  });
});

app.use(errorHandler);

export default app;

