import  { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";
import type { UserRole } from "../types/index.js";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Autentiering krävs");
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ForbiddenError("Du saknar behörighet för den här åtgärden");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};