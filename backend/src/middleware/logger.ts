// src/middleware/logger.ts
import pino from 'pino';
import { env } from '../config/env.js';

const logger = pino({
  level: 'info',
  transport: env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,

  // Skyddar känsliga fält ersätts med [REDACTED] i loggarna
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      '*.password',
      '*.passwordHash',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;