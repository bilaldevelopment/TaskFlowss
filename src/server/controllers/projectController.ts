import { Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sanitizeUser } from '../utils/auth.js';
import { canAccessProject, canManageProject } from '../middleware/rbac.js';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  key: z
    .string()
    .min(2, 'Key must be 2-6 uppercase letters')
    .max(6)
    .regex(/^[A-Z0-9]+$/, 'Key must be uppercase alphanumeric'),
  description: z.string().max(1000).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed']).optional().default('active'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color code').optional().default('#4F46E5'),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['manager', 'contributor', 'viewer']).default('contributor'),
});

export function getProjects(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  let projects = dbStore.getProjects();

  // If not admin, only show projects where user is owner or member
  if (user.role !== 'admin') {
    projects = projects.filter(
      (p) => p.ownerId === user._id || p.members.some((m) => m.userId === user._id)
    );
  }

  const { search, status } = req.query;
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    projects = projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (status && typeof status === 'string') {
    projects = projects.filter((p) => p.status === status);
  }

  // Calculate task counts for each project
  const allTasks = dbStore.getTasks();
  const projectsWithStats = projects.map((project) => {
    const projectTasks = allTasks.filter((t) => t.projectId === project._id);
    const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
    const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
    const owner = dbStore.findUserById(project.ownerId);

    return {
      ...project,
      owner: owner ? sanitizeUser(owner) : null,
      taskCount: projectTasks.length,
      completedTaskCount: completedTasks,
      progress,
    };
  });

  res.status(200).json({
    projects: projectsWithStats,
    total: projectsWithStats.length,
  });
}

export function createProject(req: AuthenticatedRequest, res: Response) {
  const user = req.user!;
  const { name, key, description, status, color, startDate, targetDate } = req.body;

  // Check unique key
  const existingWithKey = dbStore.getProjects().find((p) => p.key === key.toUpperCase());
  if (existingWithKey) {
    res.status(409).json({ error: `A project with key '${key}' already exists.` });
    return;
  }

  const project = dbStore.createProject({
    name,
    key: key.toUpperCase(),
    description,
    status,
    ownerId: user._id,
    color,
    startDate,
    targetDate,
    members: [{ userId: user._id, role: 'owner' }],
  });

  dbStore.logActivity({
    projectId: project._id,
    userId: user._id,
    action: 'created_project',
    details: { name: project.name, key: project.key },
  });

  res.status(201).json({
    message: 'Project created successfully',
    project,
  });
}

export function getProjectById(req: AuthenticatedRequest, res: Response) {
  const { projectId } = req.params;

  if (!canAccessProject(req, projectId)) {
    res.status(403).json({ error: 'You do not have permission to access this project.' });
    return;
  }

  const project = dbStore.findProjectById(projectId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const owner = dbStore.findUserById(project.ownerId);
  const populatedMembers = project.members.map((m) => {
    const u = dbStore.findUserById(m.userId);
    return {
      user: u ? sanitizeUser(u) : null,
      role: m.role,
    };
  });

  const projectTasks = dbStore.getTasks().filter((t) => t.projectId === projectId);
  const completed = projectTasks.filter((t) => t.status === 'completed').length;
  const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length;
  const inReview = projectTasks.filter((t) => t.status === 'in_review').length;
  const todo = projectTasks.filter((t) => t.status === 'todo').length;

  res.status(200).json({
    project: {
      ...project,
      owner: owner ? sanitizeUser(owner) : null,
      members: populatedMembers,
    },
    taskStats: {
      total: projectTasks.length,
      completed,
      inProgress,
      inReview,
      todo,
      progress: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0,
    },
  });
}

export function updateProject(req: AuthenticatedRequest, res: Response) {
  const { projectId } = req.params;

  if (!canManageProject(req, projectId)) {
    res.status(403).json({ error: 'You do not have permission to modify this project.' });
    return;
  }

  const updated = dbStore.updateProject(projectId, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  dbStore.logActivity({
    projectId,
    userId: req.user!._id,
    action: 'updated_project',
    details: req.body,
  });

  res.status(200).json({
    message: 'Project updated successfully',
    project: updated,
  });
}

export function deleteProject(req: AuthenticatedRequest, res: Response) {
  const { projectId } = req.params;
  const user = req.user!;
  const project = dbStore.findProjectById(projectId);

  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  if (user.role !== 'admin' && project.ownerId !== user._id) {
    res.status(403).json({ error: 'Only the project owner or workspace admin can delete this project.' });
    return;
  }

  dbStore.deleteProject(projectId);

  res.status(200).json({ message: 'Project and all associated tasks deleted successfully' });
}

export function addMember(req: AuthenticatedRequest, res: Response) {
  const { projectId } = req.params;
  const { userId, role } = req.body;

  if (!canManageProject(req, projectId)) {
    res.status(403).json({ error: 'Permission denied to manage project members' });
    return;
  }

  const project = dbStore.findProjectById(projectId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  const userToAdd = dbStore.findUserById(userId);
  if (!userToAdd) {
    res.status(404).json({ error: 'User to add not found' });
    return;
  }

  const existingMember = project.members.find((m) => m.userId === userId);
  if (existingMember) {
    existingMember.role = role;
  } else {
    project.members.push({ userId, role });
  }

  dbStore.save();

  dbStore.createNotification({
    recipientId: userId,
    senderId: req.user!._id,
    title: 'Added to Project',
    message: `You were added to "${project.name}" as a ${role}.`,
    type: 'system',
    link: `/projects/${projectId}`,
    read: false,
  });

  res.status(200).json({ message: 'Member added/updated successfully', project });
}

export function removeMember(req: AuthenticatedRequest, res: Response) {
  const { projectId, userId } = req.params;

  if (!canManageProject(req, projectId)) {
    res.status(403).json({ error: 'Permission denied to manage project members' });
    return;
  }

  const project = dbStore.findProjectById(projectId);
  if (!project) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }

  if (project.ownerId === userId) {
    res.status(400).json({ error: 'Cannot remove the project owner.' });
    return;
  }

  project.members = project.members.filter((m) => m.userId !== userId);
  dbStore.save();

  res.status(200).json({ message: 'Member removed successfully', project });
}
