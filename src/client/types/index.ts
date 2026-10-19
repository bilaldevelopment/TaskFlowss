export type UserRole = 'admin' | 'project_manager' | 'member';
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';
export type ProjectMemberRole = 'owner' | 'manager' | 'contributor' | 'viewer';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType =
  | 'task_assigned'
  | 'status_change'
  | 'comment_added'
  | 'deadline_approaching'
  | 'system';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
}

export interface ProjectMember {
  user: User | null;
  role: ProjectMemberRole;
}

export interface Project {
  _id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  owner?: User | null;
  members: ProjectMember[];
  color: string;
  startDate?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedTaskCount?: number;
  progress?: number;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  project?: {
    _id: string;
    name: string;
    key: string;
    color: string;
  } | null;
  assigneeId?: string;
  assignee?: User | null;
  creatorId: string;
  creator?: User | null;
  dueDate?: string;
  tags: string[];
  order: number;
  estimatedHours?: number;
  actualHours?: number;
  commentsCount?: number;
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  taskId: string;
  authorId: string;
  author?: User | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipientId: string;
  senderId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  taskId?: string;
  projectId?: string;
  userId: string;
  user?: User | null;
  action: string;
  details: Record<string, any>;
  createdAt: string;
  project?: {
    name: string;
    color: string;
  } | null;
}

export interface DashboardMetrics {
  metrics: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    inReviewTasks: number;
    todoTasks: number;
    overdueTasks: number;
    completionRate: number;
    activeProjectsCount: number;
  };
  priorityDistribution: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  statusDistribution: Array<{
    name: string;
    count: number;
    color: string;
  }>;
  projectBreakdown: Array<{
    id: string;
    name: string;
    key: string;
    color: string;
    total: number;
    completed: number;
    progress: number;
  }>;
  upcomingDeadlines: Array<{
    _id: string;
    title: string;
    dueDate: string;
    priority: TaskPriority;
    project?: { name: string; color: string } | null;
    assignee?: User | null;
  }>;
  recentActivity: ActivityLog[];
  myWork: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}
