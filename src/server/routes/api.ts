import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../controllers/authController.js';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from '../controllers/projectController.js';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createTaskSchema,
  updateTaskSchema,
} from '../controllers/taskController.js';
import {
  getComments,
  createComment,
  deleteComment,
  createCommentSchema,
} from '../controllers/commentController.js';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { getUsers } from '../controllers/userController.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { requireRole } from '../middleware/rbac.js';

export const apiRouter = Router();

// Health check
apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'TaskFlow API', timestamp: new Date().toISOString() });
});

// Authentication routes
apiRouter.post('/auth/register', validate({ body: registerSchema }), register);
apiRouter.post('/auth/login', validate({ body: loginSchema }), login);
apiRouter.post('/auth/logout', logout);
apiRouter.get('/auth/me', authenticate, getMe);
apiRouter.patch('/auth/profile', authenticate, validate({ body: updateProfileSchema }), updateProfile);
apiRouter.post('/auth/change-password', authenticate, validate({ body: changePasswordSchema }), changePassword);

// Projects routes
apiRouter.get('/projects', authenticate, getProjects);
apiRouter.post(
  '/projects',
  authenticate,
  requireRole('admin', 'project_manager'),
  validate({ body: createProjectSchema }),
  createProject
);
apiRouter.get('/projects/:projectId', authenticate, getProjectById);
apiRouter.patch('/projects/:projectId', authenticate, validate({ body: updateProjectSchema }), updateProject);
apiRouter.delete('/projects/:projectId', authenticate, deleteProject);
apiRouter.post(
  '/projects/:projectId/members',
  authenticate,
  validate({ body: addMemberSchema }),
  addMember
);
apiRouter.delete('/projects/:projectId/members/:userId', authenticate, removeMember);

// Tasks routes
apiRouter.get('/tasks', authenticate, getTasks);
apiRouter.post('/tasks', authenticate, validate({ body: createTaskSchema }), createTask);
apiRouter.get('/tasks/:taskId', authenticate, getTaskById);
apiRouter.patch('/tasks/:taskId', authenticate, validate({ body: updateTaskSchema }), updateTask);
apiRouter.delete('/tasks/:taskId', authenticate, deleteTask);

// Comments routes
apiRouter.get('/tasks/:taskId/comments', authenticate, getComments);
apiRouter.post(
  '/tasks/:taskId/comments',
  authenticate,
  validate({ body: createCommentSchema }),
  createComment
);
apiRouter.delete('/comments/:commentId', authenticate, deleteComment);

// Analytics routes
apiRouter.get('/analytics/dashboard', authenticate, getDashboardAnalytics);

// Users / Team routes
apiRouter.get('/users', authenticate, getUsers);

// Notifications routes
apiRouter.get('/notifications', authenticate, getNotifications);
apiRouter.patch('/notifications/:id/read', authenticate, markAsRead);
apiRouter.post('/notifications/mark-all-read', authenticate, markAllAsRead);
