import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { fail } from '../lib/responses.js';

export function notFound(req: Request, res: Response) {
  res.status(404).json(fail(`Not found: ${req.method} ${req.path}`, { code: 'NOT_FOUND' }));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json(fail('Validation error', { code: 'VALIDATION_ERROR', details: err.flatten() }));
  }

  if (err instanceof Error) {
    return res.status(500).json(fail(err.message || 'Internal Server Error', { code: 'INTERNAL_ERROR' }));
  }

  return res.status(500).json(fail('Internal Server Error', { code: 'INTERNAL_ERROR' }));
}

