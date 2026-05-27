// src/app.ts
import express from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';
import healthRouter from "./routes/health.js";
import logger from './middleware/logger.js';

const app = express();
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/health", healthRouter);

app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Sidan finns inte' });
});

app.use(errorHandler);

export default app;
