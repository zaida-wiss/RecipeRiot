// src/config/baseLogger.ts
import pino from 'pino';

// baseLogger är appens grundlogger.
// Den kan användas utanför HTTP-flödet, t.ex. vid serverstart,
// databasanslutning eller schemalagda jobb.
const baseLogger = pino({
  // LOG_LEVEL gör det möjligt att styra hur mycket som loggas via .env.
  // Om inget anges loggar vi från info och uppåt.
  level: process.env.LOG_LEVEL || 'info',

  // I utveckling gör pino-pretty JSON-loggarna lättare att läsa i terminalen.
  // I produktion behåller vi ren JSON eftersom loggsystem lättare kan läsa det.
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty' }
    : undefined,

  // redact är ett skyddsnät: om vi råkar logga känsliga fält
  // byts värdet ut mot [REDACTED] innan loggen skrivs.
  redact: {
    paths: [
      // Tokens och cookies fungerar som nycklar till användarens konto.
      'req.headers.authorization',
      'req.headers.cookie',

      // Lösenord, hashade lösenord och tokens ska aldrig hamna i loggar.
      'req.body.password',
      'req.body.passwordHash',
      'req.body.token',

      // Wildcards skyddar även om vi loggar ett eget objekt,
      // t.ex. logger.info({ user }, '...').
      '*.password',
      '*.passwordHash',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});

export default baseLogger;
