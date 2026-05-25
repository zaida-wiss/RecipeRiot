import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError.js';
import type { JwtPayload } from '../types/index.js';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    // Klienten ska skicka:
    // Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Autentisering krävs');
    }

    // Plocka ut själva token-delen efter "Bearer ".
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET saknas i miljövariabler');
    }

    // jwt.verify kontrollerar att tokenen är signerad med rätt secret.
    const payload = jwt.verify(token, secret) as JwtPayload;

    // Nu sparar vi användaren på req, så nästa controller kan läsa den.
    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (error) {
    // Om tokenen är trasig eller utgången får klienten 401.
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Ogiltig eller utgången token'));
      return;
    }

    next(error);
  }
};
