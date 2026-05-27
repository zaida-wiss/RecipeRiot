// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';
import healthRouter from "./routes/health.js";
import logger from './middleware/logger.js';
import favoritesRouter from './routes/favorites.js';


const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Säkerhetsheaders
app.use(helmet());

// CORS
app.use(cors({ origin: allowedOrigin }));

// Rate limiting — max 100 anrop per 15 min
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'För många anrop, försök igen senare' },
});

// Striktare för login — max 5 försök per 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'För många inloggningsförsök, försök igen senare' },
});

app.use('/api/', generalLimiter);
app.use('/api/v1/auth/login', loginLimiter);

// JSON och loggning
app.use(express.json());
app.use(pinoHttp({ logger }));

// Routes
app.use("/health", healthRouter);
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);

// 404
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Sidan finns inte' });
});

app.use(errorHandler);

export default app;