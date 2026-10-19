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

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  userId: string;
  role: ProjectMemberRole;
}

export interface ProjectDoc {
  _id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  ownerId: string;
  members: ProjectMember[];
  color: string;
  startDate?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDoc {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  dueDate?: string;
  tags: string[];
  order: number;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDoc {
  _id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDoc {
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

export interface ActivityLogDoc {
  _id: string;
  taskId?: string;
  projectId?: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  createdAt: string;
}

export interface DatabaseState {
  users: UserDoc[];
  projects: ProjectDoc[];
  tasks: TaskDoc[];
  comments: CommentDoc[];
  notifications: NotificationDoc[];
  activityLogs: ActivityLogDoc[];
}
