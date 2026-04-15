import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { fail } from '../lib/responses.js';

export type AuthUser = { id: string; role: string };

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization') || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json(fail('Unauthorized', { code: 'UNAUTHORIZED' }));

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { sub?: string; role?: string };
    if (!payload?.sub) return res.status(401).json(fail('Unauthorized', { code: 'UNAUTHORIZED' }));
    req.user = { id: payload.sub, role: payload.role ?? 'RESIDENT' };
    return next();
  } catch {
    return res.status(401).json(fail('Unauthorized', { code: 'UNAUTHORIZED' }));
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json(fail('Unauthorized', { code: 'UNAUTHORIZED' }));
    if (!roles.includes(req.user.role)) return res.status(403).json(fail('Forbidden', { code: 'FORBIDDEN' }));
    return next();
  };
}

