import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../src/server/app.js';
import { dbStore } from '../src/server/db/store.js';

const app = createExpressApp();

describe('TaskFlow REST API Test Suite', () => {
  let adminToken: string;
  let memberToken: string;
  let createdProjectId: string;
  let createdTaskId: string;

  beforeAll(() => {
    dbStore.resetToSeeds();
  });

  describe('Health and System Status', () => {
    it('GET /api/v1/health should return 200 OK', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Authentication Flow', () => {
    it('POST /api/v1/auth/login should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alex.admin@taskflow.dev', password: 'WrongPassword123' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it('POST /api/v1/auth/login should authenticate seed admin', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'alex.admin@taskflow.dev', password: 'TaskFlow2026!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('alex.admin@taskflow.dev');
      expect(res.body.user.role).toBe('admin');
      expect(res.body.user.passwordHash).toBeUndefined(); // Verify passwordHash is never leaked
      adminToken = res.body.token;
    });

    it('POST /api/v1/auth/login should authenticate seed member', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'david.dev@taskflow.dev', password: 'TaskFlow2026!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      memberToken = res.body.token;
    });

    it('GET /api/v1/auth/me should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/auth/me should return authenticated profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('alex.admin@taskflow.dev');
    });

    it('POST /api/v1/auth/register should fail on malformed email or short password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Bob', email: 'not-an-email', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('POST /api/v1/auth/register should create a new user account', async () => {
      const email = `newuser_${Date.now()}@taskflow.dev`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jordan Lee',
          email,
          password: 'Password123!',
          role: 'member',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(email);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('RBAC & Project Management', () => {
    it('POST /api/v1/projects should forbid regular member from creating project', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Unauthorized Project',
          key: 'UNAUTH',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Access forbidden');
    });

    it('POST /api/v1/projects should allow Admin to create a project', async () => {
      const key = 'TST' + Math.floor(Math.random() * 900 + 100);
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Automation Project',
          key,
          description: 'A test project created by automation',
          color: '#3B82F6',
        });

      expect(res.status).toBe(201);
      expect(res.body.project.name).toBe('Test Automation Project');
      createdProjectId = res.body.project._id;
    });

    it('GET /api/v1/projects should return project list with task statistics', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
    });
  });

  describe('Task Operations & Kanban Synchronization', () => {
    it('POST /api/v1/tasks should create a new task', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Implement OAuth Token Refresh',
          description: 'Add auto-refresh on 401 responses',
          projectId: createdProjectId,
          priority: 'high',
          status: 'todo',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
          tags: ['Backend', 'Security'],
          estimatedHours: 6,
        });

      expect(res.status).toBe(201);
      expect(res.body.task.title).toBe('Implement OAuth Token Refresh');
      expect(res.body.task.status).toBe('todo');
      createdTaskId = res.body.task._id;
    });

    it('PATCH /api/v1/tasks/:taskId should update task status for Kanban moves', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.task.status).toBe('in_progress');
    });

    it('POST /api/v1/tasks/:taskId/comments should append comment and audit trail', async () => {
      const res = await request(app)
        .post(`/api/v1/tasks/${createdTaskId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'Started working on unit tests for refresh logic.' });

      expect(res.status).toBe(201);
      expect(res.body.comment.content).toContain('Started working');
    });

    it('GET /api/v1/tasks/:taskId should return populated details, comments, and activity', async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${createdTaskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.task._id).toBe(createdTaskId);
      expect(res.body.comments.length).toBeGreaterThan(0);
      expect(res.body.activity.length).toBeGreaterThan(0);
    });
  });

  describe('Dashboard Analytics Engine', () => {
    it('GET /api/v1/analytics/dashboard should aggregate real data', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.metrics.totalTasks).toBeGreaterThan(0);
      expect(res.body.priorityDistribution).toBeDefined();
      expect(res.body.statusDistribution).toBeDefined();
      expect(Array.isArray(res.body.recentActivity)).toBe(true);
    });

    it('GET /api/v1/users should list team members with assigned task counts', async () => {
      const res = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users[0].stats).toBeDefined();
    });

    it('GET /api/v1/notifications should return user notification feed', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.notifications)).toBe(true);
      expect(typeof res.body.unreadCount).toBe('number');
    });
  });
});
