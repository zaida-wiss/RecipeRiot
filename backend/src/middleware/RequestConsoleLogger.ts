// src/middleware/requestConsoleLogger.ts
import { Request, Response, NextFunction } from 'express';

// Enkel egen middleware som loggar varje request innan den går vidare till routes.
const requestConsoleLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  console.log(`${req.method} ${req.path}`);
  // next() måste anropas, annars stannar requesten här.
  next();
};

export default requestConsoleLogger;
