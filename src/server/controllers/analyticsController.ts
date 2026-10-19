import { Response } from 'express';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sanitizeUser } from '../utils/auth.js';

export function getDashboardAnalytics(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  let tasks = dbStore.getTasks();
  let projects = dbStore.getProjects();

  // Scope to user's authorized projects unless admin
  if (user.role !== 'admin') {
    const accessibleProjectIds = new Set(
      projects
        .filter((p) => p.ownerId === user._id || p.members.some((m) => m.userId === user._id))
        .map((p) => p._id)
    );
    tasks = tasks.filter((t) => accessibleProjectIds.has(t.projectId));
    projects = projects.filter((p) => accessibleProjectIds.has(p._id));
  }

  const { projectId } = req.query;
  if (projectId && typeof projectId === 'string') {
    tasks = tasks.filter((t) => t.projectId === projectId);
  }

  const now = new Date();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'in_review').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now
  ).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Priority distribution
  const priorityDistribution = [
    { name: 'Urgent', count: tasks.filter((t) => t.priority === 'urgent').length, color: '#EF4444' },
    { name: 'High', count: tasks.filter((t) => t.priority === 'high').length, color: '#F97316' },
    { name: 'Medium', count: tasks.filter((t) => t.priority === 'medium').length, color: '#3B82F6' },
    { name: 'Low', count: tasks.filter((t) => t.priority === 'low').length, color: '#10B981' },
  ];

  // Status distribution
  const statusDistribution = [
    { name: 'To Do', count: todoTasks, color: '#94A3B8' },
    { name: 'In Progress', count: inProgressTasks, color: '#3B82F6' },
    { name: 'In Review', count: inReviewTasks, color: '#8B5CF6' },
    { name: 'Completed', count: completedTasks, color: '#10B981' },
  ];

  // Project breakdown
  const projectBreakdown = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p._id);
    const pCompleted = pTasks.filter((t) => t.status === 'completed').length;
    const progress = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;
    return {
      id: p._id,
      name: p.name,
      key: p.key,
      color: p.color,
      total: pTasks.length,
      completed: pCompleted,
      progress,
    };
  });

  // Upcoming deadlines in next 14 days
  const future14Days = new Date(Date.now() + 14 * 86400000);
  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= future14Days)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 6)
    .map((t) => {
      const proj = dbStore.findProjectById(t.projectId);
      const assignee = t.assigneeId ? dbStore.findUserById(t.assigneeId) : null;
      return {
        _id: t._id,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
        project: proj ? { name: proj.name, color: proj.color } : null,
        assignee: assignee ? sanitizeUser(assignee) : null,
      };
    });

  // My Tasks summary
  const myTasks = tasks.filter((t) => t.assigneeId === user._id);
  const myCompleted = myTasks.filter((t) => t.status === 'completed').length;
  const myPending = myTasks.filter((t) => t.status !== 'completed').length;
  const myOverdue = myTasks.filter(
    (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now
  ).length;

  // Recent activity logs
  const rawLogs = dbStore.getRecentActivity(8);
  const recentActivity = rawLogs.map((log) => {
    const actor = dbStore.findUserById(log.userId);
    const proj = log.projectId ? dbStore.findProjectById(log.projectId) : null;
    return {
      ...log,
      user: actor ? sanitizeUser(actor) : null,
      project: proj ? { name: proj.name, color: proj.color } : null,
    };
  });

  res.status(200).json({
    metrics: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      inReviewTasks,
      todoTasks,
      overdueTasks,
      completionRate,
      activeProjectsCount: projects.filter((p) => p.status === 'active').length,
    },
    priorityDistribution,
    statusDistribution,
    projectBreakdown,
    upcomingDeadlines,
    recentActivity,
    myWork: {
      total: myTasks.length,
      completed: myCompleted,
      pending: myPending,
      overdue: myOverdue,
    },
  });
}
