// src/app.ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
<<<<<<< HEAD
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';
import logger from './middleware/logger.js';
import healthRouter from "./routes/health.js";

=======

// 1. Moderna TypeScript-importer för era rutter och middlewares
import recipesRouter from './routes/recipes';
import usersRouter from './routes/users';
import logger from './middleware/logger'
import { errorHandler } from './middleware/errorHandler';
>>>>>>> 80ebae6 (lagt till autentisering, bcryp och JWT)

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: allowedOrigin,
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);

// Health-kontroll
app.use("/health", healthRouter);

// Routes
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);

// 404 - om ingen route matchar (Viktigt att denna ligger efter rutterna men före errorHandler)
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Sidan finns inte' });
});

// Central felhantering (MÅSTE ligga absolut sist)
app.use(errorHandler);

export default app;
