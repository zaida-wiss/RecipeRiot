// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import usersRouter from './routes/users.js';
import healthRouter from "./routes/health.js";
import gdprRouter from "./routes/gdpr.js";
import favoritesRouter from './routes/favorites.js';
import adminRouter from './routes/admin.js';
import logger from './middleware/logger.js';
import { env } from './config/env.js';

const app = express();
app.set('trust proxy', 1);

// Säkerhetsheaders
app.use(helmet());

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'För många anrop, försök igen senare' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'För många inloggningsförsök, försök igen senare' },
});

app.use('/api/', generalLimiter);
app.use('/api/v1/auth/login', loginLimiter);

// JSON och loggning
app.use(express.json());
app.use(logger);

// Routes
app.use("/health", healthRouter);
app.use('/api/v1/recipes', recipesRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/gdpr', gdprRouter);
app.use("/api/v1/admin", adminRouter);

// 404
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Sidan finns inte' });
});

app.use(errorHandler);

export default app;
