import { Request, Response, NextFunction } from 'express';

export default function logger(req: Request, _res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.path}`);
  next();
}