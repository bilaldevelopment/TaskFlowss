import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import {
  ActivityLogDoc,
  CommentDoc,
  DatabaseState,
  NotificationDoc,
  ProjectDoc,
  TaskDoc,
  UserDoc,
} from './types.js';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'taskflow-db.json');

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

class Store {
  private state: DatabaseState = {
    users: [],
    projects: [],
    tasks: [],
    comments: [],
    notifications: [],
    activityLogs: [],
  };
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        // Ensure all arrays exist
        this.state.users = this.state.users || [];
        this.state.projects = this.state.projects || [];
        this.state.tasks = this.state.tasks || [];
        this.state.comments = this.state.comments || [];
        this.state.notifications = this.state.notifications || [];
        this.state.activityLogs = this.state.activityLogs || [];
      } else {
        this.seedInitialData();
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing with seeds:', err);
      this.seedInitialData();
    }
    this.isInitialized = true;
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('TaskFlow2026!', salt);

    const now = new Date();
    const isoNow = now.toISOString();

    const uAdmin: UserDoc = {
      _id: 'usr_admin1',
      name: 'Alex Rivers',
      email: 'alex.admin@taskflow.dev',
      passwordHash: demoPasswordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      title: 'Workspace Administrator',
      department: 'Engineering Leadership',
      isActive: true,
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    const uPM: UserDoc = {
      _id: 'usr_pm1',
      name: 'Sarah Chen',
      email: 'sarah.pm@taskflow.dev',
      passwordHash: demoPasswordHash,
      role: 'project_manager',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      title: 'Lead Product Manager',
      department: 'Product Strategy',
      isActive: true,
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    const uMember: UserDoc = {
      _id: 'usr_mem1',
      name: 'David Kim',
      email: 'david.dev@taskflow.dev',
      passwordHash: demoPasswordHash,
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      title: 'Senior Frontend Engineer',
      department: 'UI/UX Engineering',
      isActive: true,
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    const uIntern: UserDoc = {
      _id: 'usr_intern1',
      name: 'Elena Rostova',
      email: 'elena.intern@taskflow.dev',
      passwordHash: demoPasswordHash,
      role: 'member',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      title: 'Software Engineering Intern',
      department: 'Core Team',
      isActive: true,
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    this.state.users = [uAdmin, uPM, uMember, uIntern];

    // Projects
    const p1: ProjectDoc = {
      _id: 'prj_mobile1',
      name: 'Mobile App Redesign',
      key: 'MOB',
      description: 'Revamping the core iOS and Android client applications with sleek new design system, offline sync, and fast navigation.',
      status: 'active',
      ownerId: uPM._id,
      color: '#4F46E5', // Indigo
      startDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      targetDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      members: [
        { userId: uPM._id, role: 'owner' },
        { userId: uMember._id, role: 'contributor' },
        { userId: uIntern._id, role: 'contributor' },
        { userId: uAdmin._id, role: 'manager' },
      ],
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    const p2: ProjectDoc = {
      _id: 'prj_cloud1',
      name: 'Cloud Infrastructure Migration',
      key: 'OPS',
      description: 'Transitioning mission-critical microservices to Kubernetes clusters with zero-downtime failover and automated CI/CD pipelines.',
      status: 'active',
      ownerId: uAdmin._id,
      color: '#0EA5E9', // Sky blue
      startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
      targetDate: new Date(Date.now() + 45 * 86400000).toISOString(),
      members: [
        { userId: uAdmin._id, role: 'owner' },
        { userId: uMember._id, role: 'contributor' },
      ],
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    const p3: ProjectDoc = {
      _id: 'prj_portal1',
      name: 'Enterprise Customer Portal v2',
      key: 'PORT',
      description: 'Building self-service customer portal with interactive telemetry dashboards and automated billing management.',
      status: 'planning',
      ownerId: uPM._id,
      color: '#10B981', // Emerald green
      startDate: isoNow,
      targetDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      members: [
        { userId: uPM._id, role: 'owner' },
        { userId: uAdmin._id, role: 'manager' },
        { userId: uIntern._id, role: 'contributor' },
      ],
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    this.state.projects = [p1, p2, p3];

    // Tasks
    const overdueDate = new Date(Date.now() - 3 * 86400000).toISOString();
    const soonDate = new Date(Date.now() + 2 * 86400000).toISOString();
    const nextWeekDate = new Date(Date.now() + 7 * 86400000).toISOString();
    const completedDate = new Date(Date.now() - 1 * 86400000).toISOString();

    const tasks: TaskDoc[] = [
      {
        _id: 'tsk_1',
        title: 'Design high-fidelity design tokens & component library',
        description: 'Finalize Tailwind color palettes, elevation levels, typography scales, and button component variants in Figma and sync to repository.',
        status: 'completed',
        priority: 'high',
        projectId: p1._id,
        assigneeId: uMember._id,
        creatorId: uPM._id,
        dueDate: completedDate,
        tags: ['Design', 'UI Kit', 'Sprint 1'],
        order: 1,
        estimatedHours: 16,
        actualHours: 14,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: completedDate,
      },
      {
        _id: 'tsk_2',
        title: 'Implement dark/light theme switching with zero flash',
        description: 'Configure HTML class toggling, CSS variable persistence, and system preference detection with seamless transitions.',
        status: 'completed',
        priority: 'medium',
        projectId: p1._id,
        assigneeId: uIntern._id,
        creatorId: uMember._id,
        dueDate: completedDate,
        tags: ['Frontend', 'Theme'],
        order: 2,
        estimatedHours: 8,
        actualHours: 7,
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        updatedAt: completedDate,
      },
      {
        _id: 'tsk_3',
        title: 'Build drag-and-drop Kanban board with accessible fallback',
        description: 'Interactive 4-column kanban board with column counters, visual drop targets, keyboard accessibility, and immediate backend persistence.',
        status: 'in_progress',
        priority: 'urgent',
        projectId: p1._id,
        assigneeId: uMember._id,
        creatorId: uPM._id,
        dueDate: soonDate,
        tags: ['Kanban', 'Feature', 'High Priority'],
        order: 1,
        estimatedHours: 24,
        actualHours: 18,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        _id: 'tsk_4',
        title: 'Setup automated Redis caching for high-load API endpoints',
        description: 'Evaluate cache hit ratios and configure 5-minute TTL on project dashboard analytics aggregation queries.',
        status: 'in_progress',
        priority: 'high',
        projectId: p2._id,
        assigneeId: uAdmin._id,
        creatorId: uAdmin._id,
        dueDate: overdueDate, // Overdue task demonstration
        tags: ['Backend', 'Performance', 'DevOps'],
        order: 2,
        estimatedHours: 12,
        actualHours: 9,
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        _id: 'tsk_5',
        title: 'Conduct security audit on JWT token validation & CORS policies',
        description: 'Verify HMAC SHA-256 signature checks, expiry verification, timing attack protections, and helmet headers.',
        status: 'in_review',
        priority: 'high',
        projectId: p2._id,
        assigneeId: uAdmin._id,
        creatorId: uPM._id,
        dueDate: soonDate,
        tags: ['Security', 'Audit', 'Review'],
        order: 1,
        estimatedHours: 10,
        actualHours: 8,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        _id: 'tsk_6',
        title: 'Create mobile navigation drawer and swipe gesture handlers',
        description: 'Ensure smooth touch responsiveness on tablets and mobile viewports with accessible close button and backdrop click.',
        status: 'in_review',
        priority: 'medium',
        projectId: p1._id,
        assigneeId: uIntern._id,
        creatorId: uPM._id,
        dueDate: nextWeekDate,
        tags: ['Mobile', 'UX'],
        order: 2,
        estimatedHours: 12,
        actualHours: 10,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: isoNow,
      },
      {
        _id: 'tsk_7',
        title: 'Draft OpenAPI 3.0 specification for customer billing endpoints',
        description: 'Document request schemas, response codes, and error models for external billing webhook integrations.',
        status: 'todo',
        priority: 'medium',
        projectId: p3._id,
        assigneeId: uPM._id,
        creatorId: uPM._id,
        dueDate: nextWeekDate,
        tags: ['API', 'Documentation'],
        order: 1,
        estimatedHours: 8,
        actualHours: 0,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        _id: 'tsk_8',
        title: 'Implement task comments and threaded activity audit log',
        description: 'Allow team members to collaborate directly on task detail drawers with timestamped comments and change events.',
        status: 'todo',
        priority: 'high',
        projectId: p1._id,
        assigneeId: uMember._id,
        creatorId: uPM._id,
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        tags: ['Collaboration', 'Comments'],
        order: 2,
        estimatedHours: 14,
        actualHours: 0,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
      {
        _id: 'tsk_9',
        title: 'Setup automated database backups with encryption at rest',
        description: 'Configure daily snapshots with AES-256 encryption and automated 30-day retention policies.',
        status: 'todo',
        priority: 'urgent',
        projectId: p2._id,
        assigneeId: uAdmin._id,
        creatorId: uAdmin._id,
        dueDate: new Date(Date.now() + 4 * 86400000).toISOString(),
        tags: ['Database', 'Backup', 'Security'],
        order: 3,
        estimatedHours: 16,
        actualHours: 0,
        createdAt: isoNow,
        updatedAt: isoNow,
      },
    ];

    this.state.tasks = tasks;

    // Comments
    this.state.comments = [
      {
        _id: 'cmt_1',
        taskId: 'tsk_3',
        authorId: uPM._id,
        content: 'Please make sure keyboard arrow keys can also cycle between columns for full screen reader accessibility.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        _id: 'cmt_2',
        taskId: 'tsk_3',
        authorId: uMember._id,
        content: 'Great point Sarah! Added keyboard controls and column quick-move badges to every card.',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        _id: 'cmt_3',
        taskId: 'tsk_4',
        authorId: uMember._id,
        content: 'Initial benchmarks show an 82% latency reduction when reading active task counts from cache!',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    // Activity Logs
    this.state.activityLogs = [
      {
        _id: 'act_1',
        taskId: 'tsk_3',
        projectId: p1._id,
        userId: uPM._id,
        action: 'created_task',
        details: { title: 'Build drag-and-drop Kanban board' },
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        _id: 'act_2',
        taskId: 'tsk_3',
        projectId: p1._id,
        userId: uMember._id,
        action: 'status_changed',
        details: { from: 'todo', to: 'in_progress' },
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        _id: 'act_3',
        taskId: 'tsk_1',
        projectId: p1._id,
        userId: uMember._id,
        action: 'status_changed',
        details: { from: 'in_review', to: 'completed' },
        createdAt: completedDate,
      },
    ];

    // Notifications
    this.state.notifications = [
      {
        _id: 'notif_1',
        recipientId: uMember._id,
        senderId: uPM._id,
        title: 'New Task Assignment',
        message: 'You have been assigned to "Build drag-and-drop Kanban board with accessible fallback".',
        type: 'task_assigned',
        read: false,
        link: '/tasks?taskId=tsk_3',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        _id: 'notif_2',
        recipientId: uMember._id,
        senderId: uPM._id,
        title: 'New Comment',
        message: 'Sarah Chen commented on "Build drag-and-drop Kanban board with accessible fallback".',
        type: 'comment_added',
        read: false,
        link: '/tasks?taskId=tsk_3',
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      },
      {
        _id: 'notif_3',
        recipientId: uAdmin._id,
        title: 'Approaching Milestone',
        message: 'Cloud Infrastructure Migration target completion is in 45 days.',
        type: 'deadline_approaching',
        read: true,
        link: '/projects/prj_cloud1',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      },
    ];

    this.save();
  }

  // --- Users Operations ---
  public getUsers() {
    return this.state.users;
  }

  public findUserById(id: string): UserDoc | undefined {
    return this.state.users.find((u) => u._id === id);
  }

  public findUserByEmail(email: string): UserDoc | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Omit<UserDoc, '_id' | 'createdAt' | 'updatedAt'>): UserDoc {
    const now = new Date().toISOString();
    const newUser: UserDoc = {
      ...userData,
      _id: 'usr_' + generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.state.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<UserDoc>): UserDoc | undefined {
    const user = this.findUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return user;
  }

  // --- Projects Operations ---
  public getProjects() {
    return this.state.projects;
  }

  public findProjectById(id: string): ProjectDoc | undefined {
    return this.state.projects.find((p) => p._id === id);
  }

  public createProject(projectData: Omit<ProjectDoc, '_id' | 'createdAt' | 'updatedAt'>): ProjectDoc {
    const now = new Date().toISOString();
    const newProject: ProjectDoc = {
      ...projectData,
      _id: 'prj_' + generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.state.projects.push(newProject);
    this.save();
    return newProject;
  }

  public updateProject(id: string, updates: Partial<ProjectDoc>): ProjectDoc | undefined {
    const project = this.findProjectById(id);
    if (!project) return undefined;
    Object.assign(project, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return project;
  }

  public deleteProject(id: string): boolean {
    const idx = this.state.projects.findIndex((p) => p._id === id);
    if (idx === -1) return false;
    this.state.projects.splice(idx, 1);
    // Also delete associated tasks and comments
    const taskIds = this.state.tasks.filter((t) => t.projectId === id).map((t) => t._id);
    this.state.tasks = this.state.tasks.filter((t) => t.projectId !== id);
    this.state.comments = this.state.comments.filter((c) => !taskIds.includes(c.taskId));
    this.state.activityLogs = this.state.activityLogs.filter((a) => a.projectId !== id);
    this.save();
    return true;
  }

  // --- Tasks Operations ---
  public getTasks() {
    return this.state.tasks;
  }

  public findTaskById(id: string): TaskDoc | undefined {
    return this.state.tasks.find((t) => t._id === id);
  }

  public createTask(taskData: Omit<TaskDoc, '_id' | 'createdAt' | 'updatedAt'>): TaskDoc {
    const now = new Date().toISOString();
    const newTask: TaskDoc = {
      ...taskData,
      _id: 'tsk_' + generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.state.tasks.push(newTask);
    this.save();
    return newTask;
  }

  public updateTask(id: string, updates: Partial<TaskDoc>): TaskDoc | undefined {
    const task = this.findTaskById(id);
    if (!task) return undefined;
    Object.assign(task, updates, { updatedAt: new Date().toISOString() });
    this.save();
    return task;
  }

  public deleteTask(id: string): boolean {
    const idx = this.state.tasks.findIndex((t) => t._id === id);
    if (idx === -1) return false;
    this.state.tasks.splice(idx, 1);
    this.state.comments = this.state.comments.filter((c) => c.taskId !== id);
    this.state.activityLogs = this.state.activityLogs.filter((a) => a.taskId !== id);
    this.save();
    return true;
  }

  // --- Comments Operations ---
  public getCommentsByTask(taskId: string): CommentDoc[] {
    return this.state.comments.filter((c) => c.taskId === taskId);
  }

  public createComment(commentData: Omit<CommentDoc, '_id' | 'createdAt' | 'updatedAt'>): CommentDoc {
    const now = new Date().toISOString();
    const newComment: CommentDoc = {
      ...commentData,
      _id: 'cmt_' + generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.state.comments.push(newComment);
    this.save();
    return newComment;
  }

  public deleteComment(id: string): boolean {
    const idx = this.state.comments.findIndex((c) => c._id === id);
    if (idx === -1) return false;
    this.state.comments.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Notifications Operations ---
  public getNotificationsByUser(userId: string): NotificationDoc[] {
    return this.state.notifications
      .filter((n) => n.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notificationData: Omit<NotificationDoc, '_id' | 'createdAt'>): NotificationDoc {
    const newNotification: NotificationDoc = {
      ...notificationData,
      _id: 'notif_' + generateId(),
      createdAt: new Date().toISOString(),
    };
    this.state.notifications.unshift(newNotification);
    this.save();
    return newNotification;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.state.notifications.find((n) => n._id === id && n.recipientId === userId);
    if (!notif) return false;
    notif.read = true;
    this.save();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.state.notifications.forEach((n) => {
      if (n.recipientId === userId) {
        n.read = true;
      }
    });
    this.save();
  }

  // --- Activity Log Operations ---
  public logActivity(logData: Omit<ActivityLogDoc, '_id' | 'createdAt'>): ActivityLogDoc {
    const newLog: ActivityLogDoc = {
      ...logData,
      _id: 'act_' + generateId(),
      createdAt: new Date().toISOString(),
    };
    this.state.activityLogs.unshift(newLog);
    // Keep max 200 logs to prevent unbounded growth
    if (this.state.activityLogs.length > 200) {
      this.state.activityLogs.length = 200;
    }
    this.save();
    return newLog;
  }

  public getActivityByTask(taskId: string): ActivityLogDoc[] {
    return this.state.activityLogs.filter((a) => a.taskId === taskId);
  }

  public getActivityByProject(projectId: string): ActivityLogDoc[] {
    return this.state.activityLogs.filter((a) => a.projectId === projectId);
  }

  public getRecentActivity(limit = 10): ActivityLogDoc[] {
    return this.state.activityLogs.slice(0, limit);
  }

  // Helper to reset seed data for testing
  public resetToSeeds() {
    this.seedInitialData();
  }
}

export const dbStore = new Store();
