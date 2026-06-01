// src/middleware/logger.ts
import pinoHttp from 'pino-http';

const logger = pinoHttp({
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.passwordHash',
    ],
    censor: '[REDACTED]',
  },
});

export default logger;