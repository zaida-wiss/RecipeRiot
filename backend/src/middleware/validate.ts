// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError.js";
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

// Hjälpfunktion
type ValidationLocation = 'body' | 'params' | 'query';

type ValidationIssue = {
  location: ValidationLocation;
  field: string;
  message: string;
};

type ValidateSchemaOptions = {
  schema: ZodTypeAny | undefined;
  value: unknown;
  location: ValidationLocation;
  saveValidatedData: (data: unknown) => void;
  errors: ValidationIssue[];
};

function validateSchema({
  schema,
  value,
  location,
  saveValidatedData,
  errors,
}: ValidateSchemaOptions): void {
  if (!schema) {
    return;
  }

  const result = schema.safeParse(value);

  if (!result.success) {
    result.error.issues.forEach((i) =>
      errors.push({ location, field: i.path.join('.'), message: i.message })
    );
    return;
  }

  saveValidatedData(result.data);
}


// ─── Middleware-fabrik ────────────────────────────────────────────────────────
export function validateRequest(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: ValidationIssue[] = [];

    validateSchema({
      schema: schemas.body,
      value: req.body,
      location: 'body',
      saveValidatedData: (data) => {
        req.validatedBody = data;
      },
      errors,
    });

    validateSchema({
      schema: schemas.params,
      value: req.params,
      location: 'params',
      saveValidatedData: (data) => {
        req.validatedParams = data;
      },
      errors,
    });

    validateSchema({
      schema: schemas.query,
      value: req.query,
      location: 'query',
      saveValidatedData: (data) => {
        req.validatedQuery = data;
      },
      errors,
    });

    if (errors.length > 0) {
      next(new ValidationError('Valideringsfel', errors));
      return;
    }

    next();
  };
}
