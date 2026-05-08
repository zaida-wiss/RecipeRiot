// src/middleware/logger.ts
import { Request, Response, NextFunction } from 'express';

const RequestConsoleLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`);
  next();
}

export default RequestConsoleLogger;