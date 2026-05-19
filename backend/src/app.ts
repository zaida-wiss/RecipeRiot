// src/app.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth';
import recipesRouter from './routes/recipes';
import usersRouter from './routes/users';
import logger from './middleware/logger';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);

// Health-kontroll
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);

// 404 - om ingen route matchar
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Sidan finns inte' });
});

app.use(errorHandler);

export default app;
