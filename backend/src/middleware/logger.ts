// src/middleware/logger.ts
import crypto from 'node:crypto';
import { pinoHttp } from 'pino-http';
import logger from '../config/logger.js';

// httpLogger är Express-middleware.
// Den loggar inkommande HTTP-requests och kopplar dem till vår vanliga logger.
const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} failed: ${err.message}`;
  },
  genReqId: (req) => {
    const requestId = req.headers['x-request-id'];
    if (typeof requestId === 'string') {
      return requestId;
    }
    return crypto.randomUUID();
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
});

export default httpLogger;
