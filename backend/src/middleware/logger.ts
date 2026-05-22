// src/middleware/logger.ts
import { Request, Response, NextFunction } from 'express';

const logger = (req: Request, _res: Response, next: NextFunction): void => {
  console.log(`${req.method} ${req.path}`);
  next();
};

export default logger;
