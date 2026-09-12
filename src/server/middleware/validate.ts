import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';
import { ValidationError } from '../models/api.model.js';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = (err as any).errors || (err as any).issues || [];
        const details = issues.map((e: any) => ({
          field: (e.path || []).join('.'),
          message: e.message
        }));
        next(new ValidationError('Invalid request payload', details));
        return;
      }
      next(err);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      Object.assign(req.query, parsed);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = (err as any).errors || (err as any).issues || [];
        const details = issues.map((e: any) => ({
          field: (e.path || []).join('.'),
          message: e.message
        }));
        next(new ValidationError('Invalid query parameters', details));
        return;
      }
      next(err);
    }
  };
};
