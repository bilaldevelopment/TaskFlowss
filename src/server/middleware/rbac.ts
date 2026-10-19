import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { UserRole } from '../db/types.js';
import { dbStore } from '../db/store.js';

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access forbidden: Requires one of [${allowedRoles.join(', ')}] roles. Your current role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
}

export function canAccessProject(req: AuthenticatedRequest, projectId: string): boolean {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;

  const project = dbStore.findProjectById(projectId);
  if (!project) return false;

  if (project.ownerId === req.user._id) return true;
  return project.members.some((m) => m.userId === req.user?._id);
}

export function canManageProject(req: AuthenticatedRequest, projectId: string): boolean {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;

  const project = dbStore.findProjectById(projectId);
  if (!project) return false;

  if (project.ownerId === req.user._id) return true;
  const member = project.members.find((m) => m.userId === req.user?._id);
  return member?.role === 'manager' || member?.role === 'owner';
}
