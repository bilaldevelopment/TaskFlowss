import { Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sanitizeUser } from '../utils/auth.js';
import { canAccessProject } from '../middleware/rbac.js';
import { TaskStatus, TaskPriority } from '../db/types.js';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(4000).optional(),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'in_review', 'completed']).default('todo'),
  dueDate: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional().default([]),
  estimatedHours: z.number().min(0).max(1000).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(4000).optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'completed']).optional(),
  dueDate: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  order: z.number().optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  actualHours: z.number().min(0).max(1000).optional(),
});

export function getTasks(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  let tasks = dbStore.getTasks();

  // Filter tasks by user project access
  if (user.role !== 'admin') {
    const accessibleProjectIds = new Set(
      dbStore
        .getProjects()
        .filter((p) => p.ownerId === user._id || p.members.some((m) => m.userId === user._id))
        .map((p) => p._id)
    );
    tasks = tasks.filter((t) => accessibleProjectIds.has(t.projectId));
  }

  const {
    projectId,
    status,
    priority,
    assigneeId,
    search,
    overdue,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = '1',
    limit = '50',
  } = req.query;

  if (projectId && typeof projectId === 'string') {
    tasks = tasks.filter((t) => t.projectId === projectId);
  }

  if (status && typeof status === 'string') {
    tasks = tasks.filter((t) => t.status === status);
  }

  if (priority && typeof priority === 'string') {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  if (assigneeId && typeof assigneeId === 'string') {
    tasks = tasks.filter((t) => t.assigneeId === assigneeId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  const now = new Date();
  if (overdue === 'true') {
    tasks = tasks.filter(
      (t) => t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now
    );
  }

  // Sorting
  tasks.sort((a: any, b: any) => {
    let aVal = a[sortBy as string];
    let bVal = b[sortBy as string];

    if (sortBy === 'dueDate') {
      aVal = aVal ? new Date(aVal).getTime() : Infinity;
      bVal = bVal ? new Date(bVal).getTime() : Infinity;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const total = tasks.length;
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedTasks = tasks.slice(startIndex, startIndex + limitNum);

  // Populate references
  const populated = paginatedTasks.map((t) => {
    const project = dbStore.findProjectById(t.projectId);
    const assignee = t.assigneeId ? dbStore.findUserById(t.assigneeId) : null;
    const creator = dbStore.findUserById(t.creatorId);
    const commentsCount = dbStore.getCommentsByTask(t._id).length;
    const isOverdue = !!(t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < now);

    return {
      ...t,
      project: project ? { _id: project._id, name: project.name, key: project.key, color: project.color } : null,
      assignee: assignee ? sanitizeUser(assignee) : null,
      creator: creator ? sanitizeUser(creator) : null,
      commentsCount,
      isOverdue,
    };
  });

  res.status(200).json({
    tasks: populated,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
}

export function createTask(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const { title, description, projectId, assigneeId, priority, status, dueDate, tags, estimatedHours } = req.body;

  if (!canAccessProject(req, projectId)) {
    res.status(403).json({ error: 'You do not have permission to create tasks in this project' });
    return;
  }

  const project = dbStore.findProjectById(projectId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  // Count existing tasks in column for ordering
  const existingInCol = dbStore.getTasks().filter((t) => t.projectId === projectId && t.status === status);

  const newTask = dbStore.createTask({
    title,
    description: description || '',
    projectId,
    assigneeId: assigneeId || undefined,
    creatorId: user._id,
    priority: (priority as TaskPriority) || 'medium',
    status: (status as TaskStatus) || 'todo',
    dueDate: dueDate || undefined,
    tags: Array.isArray(tags) ? tags : [],
    order: existingInCol.length + 1,
    estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
    actualHours: 0,
  });

  // Log activity
  dbStore.logActivity({
    taskId: newTask._id,
    projectId,
    userId: user._id,
    action: 'created_task',
    details: { title: newTask.title, status: newTask.status, priority: newTask.priority },
  });

  // Notify assignee if not self
  if (assigneeId && assigneeId !== user._id) {
    dbStore.createNotification({
      recipientId: assigneeId,
      senderId: user._id,
      title: 'Task Assigned',
      message: `${user.name} assigned you to task "${newTask.title}".`,
      type: 'task_assigned',
      link: `/tasks?taskId=${newTask._id}`,
      read: false,
    });
  }

  const populatedAssignee = newTask.assigneeId ? dbStore.findUserById(newTask.assigneeId) : null;

  res.status(201).json({
    message: 'Task created successfully',
    task: {
      ...newTask,
      project: { _id: project._id, name: project.name, key: project.key, color: project.color },
      assignee: populatedAssignee ? sanitizeUser(populatedAssignee) : null,
      creator: sanitizeUser(user),
      commentsCount: 0,
      isOverdue: false,
    },
  });
}

export function getTaskById(req: AuthenticatedRequest, res: Response) {
  const { taskId } = req.params;
  const task = dbStore.findTaskById(taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  if (!canAccessProject(req, task.projectId)) {
    res.status(403).json({ error: 'Access denied: You are not authorized for this project' });
    return;
  }

  const project = dbStore.findProjectById(task.projectId);
  const assignee = task.assigneeId ? dbStore.findUserById(task.assigneeId) : null;
  const creator = dbStore.findUserById(task.creatorId);

  const rawComments = dbStore.getCommentsByTask(taskId);
  const comments = rawComments.map((c) => {
    const author = dbStore.findUserById(c.authorId);
    return {
      ...c,
      author: author ? sanitizeUser(author) : null,
    };
  });

  const rawActivity = dbStore.getActivityByTask(taskId);
  const activity = rawActivity.map((a) => {
    const activityUser = dbStore.findUserById(a.userId);
    return {
      ...a,
      user: activityUser ? sanitizeUser(activityUser) : null,
    };
  });

  const now = new Date();
  const isOverdue = !!(task.status !== 'completed' && task.dueDate && new Date(task.dueDate) < now);

  res.status(200).json({
    task: {
      ...task,
      project: project ? { _id: project._id, name: project.name, key: project.key, color: project.color } : null,
      assignee: assignee ? sanitizeUser(assignee) : null,
      creator: creator ? sanitizeUser(creator) : null,
      commentsCount: comments.length,
      isOverdue,
    },
    comments,
    activity,
  });
}

export function updateTask(req: AuthenticatedRequest, res: Response) {
  const { taskId } = req.params;
  const user = req.user!;
  const task = dbStore.findTaskById(taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  if (!canAccessProject(req, task.projectId)) {
    res.status(403).json({ error: 'Access denied: You are not authorized for this project' });
    return;
  }

  const previousStatus = task.status;
  const previousAssigneeId = task.assigneeId;

  const updated = dbStore.updateTask(taskId, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Failed to update task' });
    return;
  }

  // Check if status changed
  if (req.body.status && req.body.status !== previousStatus) {
    dbStore.logActivity({
      taskId,
      projectId: task.projectId,
      userId: user._id,
      action: 'status_changed',
      details: { from: previousStatus, to: req.body.status },
    });

    if (task.assigneeId && task.assigneeId !== user._id) {
      dbStore.createNotification({
        recipientId: task.assigneeId,
        senderId: user._id,
        title: 'Task Status Updated',
        message: `${user.name} moved "${task.title}" to ${req.body.status.replace('_', ' ')}.`,
        type: 'status_change',
        link: `/tasks?taskId=${taskId}`,
        read: false,
      });
    }
  }

  // Check if assignee changed
  if (req.body.assigneeId !== undefined && req.body.assigneeId !== previousAssigneeId) {
    dbStore.logActivity({
      taskId,
      projectId: task.projectId,
      userId: user._id,
      action: 'assignee_changed',
      details: { from: previousAssigneeId, to: req.body.assigneeId },
    });

    if (req.body.assigneeId && req.body.assigneeId !== user._id) {
      dbStore.createNotification({
        recipientId: req.body.assigneeId,
        senderId: user._id,
        title: 'Task Assigned',
        message: `${user.name} assigned you to task "${task.title}".`,
        type: 'task_assigned',
        link: `/tasks?taskId=${taskId}`,
        read: false,
      });
    }
  }

  const project = dbStore.findProjectById(updated.projectId);
  const assignee = updated.assigneeId ? dbStore.findUserById(updated.assigneeId) : null;
  const creator = dbStore.findUserById(updated.creatorId);
  const now = new Date();
  const isOverdue = !!(updated.status !== 'completed' && updated.dueDate && new Date(updated.dueDate) < now);

  res.status(200).json({
    message: 'Task updated successfully',
    task: {
      ...updated,
      project: project ? { _id: project._id, name: project.name, key: project.key, color: project.color } : null,
      assignee: assignee ? sanitizeUser(assignee) : null,
      creator: creator ? sanitizeUser(creator) : null,
      isOverdue,
    },
  });
}

export function deleteTask(req: AuthenticatedRequest, res: Response) {
  const { taskId } = req.params;
  const user = req.user!;
  const task = dbStore.findTaskById(taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const project = dbStore.findProjectById(task.projectId);
  const isProjectOwner = project && project.ownerId === user._id;
  const isTaskCreator = task.creatorId === user._id;

  if (user.role !== 'admin' && !isProjectOwner && !isTaskCreator) {
    res.status(403).json({ error: 'Only the task creator, project owner, or workspace admin can delete this task.' });
    return;
  }

  dbStore.deleteTask(taskId);

  res.status(200).json({ message: 'Task deleted successfully' });
}
