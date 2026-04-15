import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { fail } from '../lib/responses.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(
        fail('Validation error', {
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        }),
      );
    }
    req.body = parsed.data as unknown;
    return next();
  };
}

