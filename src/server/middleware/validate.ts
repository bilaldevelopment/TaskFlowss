import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query) as any;
      }
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }
      next();
    } catch (err: any) {
      const issueList = err?.issues || err?.errors;
      if (Array.isArray(issueList)) {
        const errors = issueList.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : '',
          message: e.message || 'Invalid value',
        }));
        res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
        return;
      }
      res.status(400).json({ error: 'Malformed request payload' });
    }
  };
}
