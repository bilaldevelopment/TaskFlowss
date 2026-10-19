import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth.js';
import { dbStore } from '../db/store.js';
import { UserDoc } from '../db/types.js';

export interface AuthenticatedRequest extends Request {
  user?: UserDoc;
  tokenPayload?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. Please provide a valid Bearer token or session cookie.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired authentication token. Please sign in again.' });
    return;
  }

  const user = dbStore.findUserById(payload.id);
  if (!user || !user.isActive) {
    res.status(401).json({ error: 'User account not found or deactivated.' });
    return;
  }

  req.user = user;
  req.tokenPayload = payload;
  next();
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      const user = dbStore.findUserById(payload.id);
      if (user && user.isActive) {
        req.user = user;
        req.tokenPayload = payload;
      }
    }
  }

  next();
}
