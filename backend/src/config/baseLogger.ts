import pino from 'pino';
import { env } from './env.js';

const isProduction = env.NODE_ENV === 'production';

export const baseLogger = pino({
  level: env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),

  transport: !isProduction
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      }
    : undefined,

  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.passwordConfirm',
      'req.body.token',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.token',
    ],
    censor: '[REDACTED]',
  },

  base: {
    service: 'reciperiot-api',
    env: env.NODE_ENV,
  },
});