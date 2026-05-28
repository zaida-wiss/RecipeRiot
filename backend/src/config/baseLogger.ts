// src/config/logger.ts
import pino from 'pino';
import { env } from './env.js';

export const baseLogger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});