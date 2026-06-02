// src/app.ts
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';
import logger from './middleware/logger.js';
import healthRouter from "./routes/health.js";
import gdprRouter from "./routes/gdpr.js";
import { env } from './config/env.js';


const app = express();
const allowedOrigin = env.CORS_ORIGIN;

// Middleware
app.use(
  cors({
    origin: allowedOrigin,
  })
);
app.use(express.json());
app.use(logger);

// Health-kontroll
app.use("/health", healthRouter);

// Routes
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/gdpr', gdprRouter);

// 404 - om ingen route matchar
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Sidan finns inte' });
});

app.use(errorHandler);

export default app;
