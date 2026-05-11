import { ZodError } from 'zod';
import { ValidationError } from '../errors';

export const validateRequest =
  (schemas: any) =>
  (req: any, _res: any, next: any) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new ValidationError(
            'Validation failed',
            error.issues.map((i) => ({
              field: i.path.join('.'),
              message: i.message,
            }))
          )
        );
      }

      return next(error);
    }
  };