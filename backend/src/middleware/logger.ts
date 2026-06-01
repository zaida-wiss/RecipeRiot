// src/middleware/logger.ts
import crypto from 'node:crypto';
import { pinoHttp } from 'pino-http';
import baseLogger from '../config/baseLogger.js';

// logger är Express-middleware.
// Den loggar inkommande HTTP-requests och kopplar dem till baseLogger.
const logger = pinoHttp({
  logger: baseLogger,

  // Varje request får ett id så att flera loggrader från samma request
  // kan kopplas ihop vid felsökning.
  genReqId: (req) => {
    const requestId = req.headers['x-request-id'];

    // Om klienten eller en proxy redan skickat ett request-id återanvänder vi det.
    if (typeof requestId === 'string') {
      return requestId;
    }

    // Annars skapar servern ett nytt unikt id.
    return crypto.randomUUID();
  },

  // Loggnivån sätts efter hur allvarligt svaret är.
  // Det gör att 500-fel syns tydligare än vanliga lyckade requests.
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

export default logger;
