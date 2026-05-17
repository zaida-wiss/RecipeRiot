// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError";
import { ZodTypeAny } from "zod";

// Utökar Express Request med validerade fält
declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedParams?: any;
      validatedQuery?: any;
    }
  }
}

interface Schemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

// ─── Middleware-fabrik ────────────────────────────────────────────────────────
export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: { location: string; field: string; message: string }[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((i) =>
          errors.push({ location: 'body', field: i.path.join('.'), message: i.message })
        );
      } else {
        req.validatedBody = result.data;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((i) =>
          errors.push({ location: 'params', field: i.path.join('.'), message: i.message })
        );
      } else {
        req.validatedParams = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach((i) =>
          errors.push({ location: 'query', field: i.path.join('.'), message: i.message })
        );
      } else {
        req.validatedQuery = result.data;
      }
    }

    if (errors.length > 0) {
      next(new ValidationError('Valideringsfel', errors));
      return;
    }

    next();
  };
}