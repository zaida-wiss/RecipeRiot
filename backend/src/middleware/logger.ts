import crypto from 'node:crypto';
import pinoHttpModule from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { baseLogger } from '../config/baseLogger.js';

const pinoHttp =
  typeof pinoHttpModule === 'function'
    ? pinoHttpModule
    : pinoHttpModule.default;

const logger = pinoHttp({
  logger: baseLogger,

  genReqId: (req) => {
    const requestId = req.headers['x-request-id'];

    if (typeof requestId === 'string') {
      return requestId;
    }

    return crypto.randomUUID();
  },

  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  customErrorMessage: (req, _res, error) => {
    return `${req.method} ${req.url} failed: ${error.message}`;
  },

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
      '*.token'
    ],
    censor: '[REDACTED]',
  },

  serializers: {
    req(req: IncomingMessage & { id?: string | number }) {
      return {
        id: req.id,
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