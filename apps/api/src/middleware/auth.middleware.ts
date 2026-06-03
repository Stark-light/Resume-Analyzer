import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = authService.verifyToken(token);
    (req as AuthenticatedRequest).userId = payload.userId;
    (req as AuthenticatedRequest).userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}