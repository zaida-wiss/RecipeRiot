// src/middleware/logger.ts
import { Request, Response, NextFunction } from 'express';

const logger = (req: Request, res: Response, next: NextFunction): void => {
  // Vi sparar starttiden så vi kan räkna ut hur lång tid requesten tog.
  const startedAt = Date.now();

  // "finish" körs när svaret redan har skickats.
  // Då vet vi statusCode och kan logga ett komplett request-resultat.
  res.on("finish", () => {
    const duration = Date.now() - startedAt;

    // Logga bara teknisk metadata.
    // Logga inte req.body eller Authorization-headern, eftersom de kan innehålla
    // lösenord, tokens eller andra personuppgifter.
    console.log(
      JSON.stringify({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: duration,
      })
    );
  });

  // Skicka requesten vidare till nästa middleware eller route.
  next();
};

export default logger;
