import pino from 'pino';
import { env } from '../config/env.js';

export const baseLogger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});