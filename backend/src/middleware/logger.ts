// src/middleware/logger.ts
import pinoHttpModule from 'pino-http';
import { env } from '../config/env.js';
import type { IncomingMessage, ServerResponse } from 'node:http';

const pinoHttp =
  typeof pinoHttpModule === 'function'
    ? pinoHttpModule
    : pinoHttpModule.default;

const logger = pinoHttp({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',

  // Redaction betyder att Pino maskerar känsliga fält innan de hamnar i loggen.
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    censor: '[REDACTED]',
  },

  // Vi väljer aktivt vilka delar av requesten som får loggas.
  // Lägg inte till req.body här, eftersom body kan innehålla lösenord eller personuppgifter.
  serializers: {
    req(req: IncomingMessage) {
      return {
        method: req.method,
        url: req.url,
      };
    },
    res(res: ServerResponse) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

export default logger;
