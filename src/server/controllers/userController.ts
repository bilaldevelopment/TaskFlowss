import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sanitizeUser } from '../utils/auth.js';

export function getUsers(req: AuthenticatedRequest, res: Response) {
  const users = dbStore.getUsers().filter((u) => u.isActive);
  const tasks = dbStore.getTasks();

  const { search, role, department } = req.query;

  let filtered = users;
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.title && u.title.toLowerCase().includes(q))
    );
  }

  if (role && typeof role === 'string') {
    filtered = filtered.filter((u) => u.role === role);
  }

  if (department && typeof department === 'string') {
    filtered = filtered.filter((u) => u.department === department);
  }

  const usersWithStats = filtered.map((u) => {
    const userTasks = tasks.filter((t) => t.assigneeId === u._id);
    const completedTasks = userTasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = userTasks.filter((t) => t.status !== 'completed').length;

    return {
      ...sanitizeUser(u),
      stats: {
        totalTasks: userTasks.length,
        completedTasks,
        pendingTasks,
      },
    };
  });

  res.status(200).json({
    users: usersWithStats,
    total: usersWithStats.length,
  });
}
