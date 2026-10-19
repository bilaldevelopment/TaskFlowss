import {
  User,
  Project,
  Task,
  Comment,
  Notification,
  DashboardMetrics,
} from '../types/index.js';

const API_BASE = '/api/v1';

class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('taskflow_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error || response.statusText || 'Request failed';
    throw new ApiError(errorMsg, response.status, data?.details);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { name: string; email: string; password: string; role?: string; title?: string; department?: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  updateProfile: (profile: Partial<User>) =>
    request<{ user: User; message: string }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    }),

  changePassword: (passwords: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwords),
    }),

  // Projects
  getProjects: (params?: { search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ projects: Project[]; total: number }>(`/projects${queryString}`);
  },

  getProjectById: (projectId: string) =>
    request<{ project: Project; taskStats: any }>(`/projects/${projectId}`),

  createProject: (data: Partial<Project>) =>
    request<{ project: Project; message: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProject: (projectId: string, data: Partial<Project>) =>
    request<{ project: Project; message: string }>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProject: (projectId: string) =>
    request<{ message: string }>(`/projects/${projectId}`, {
      method: 'DELETE',
    }),

  addProjectMember: (projectId: string, memberData: { userId: string; role: string }) =>
    request<{ message: string; project: Project }>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    }),

  removeProjectMember: (projectId: string, userId: string) =>
    request<{ message: string; project: Project }>(`/projects/${projectId}/members/${userId}`, {
      method: 'DELETE',
    }),

  // Tasks
  getTasks: (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.set(key, String(value));
        }
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ tasks: Task[]; total: number; page: number; totalPages: number }>(`/tasks${queryString}`);
  },

  getTaskById: (taskId: string) =>
    request<{ task: Task; comments: Comment[]; activity: any[] }>(`/tasks/${taskId}`),

  createTask: (data: Partial<Task>) =>
    request<{ task: Task; message: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (taskId: string, data: Partial<Task>) =>
    request<{ task: Task; message: string }>(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTask: (taskId: string) =>
    request<{ message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    }),

  // Comments
  getComments: (taskId: string) =>
    request<{ comments: Comment[] }>(`/tasks/${taskId}/comments`),

  createComment: (taskId: string, content: string) =>
    request<{ comment: Comment; message: string }>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deleteComment: (commentId: string) =>
    request<{ message: string }>(`/comments/${commentId}`, {
      method: 'DELETE',
    }),

  // Analytics
  getDashboardAnalytics: (projectId?: string) => {
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return request<DashboardMetrics>(`/analytics/dashboard${query}`);
  },

  // Users
  getUsers: (params?: { search?: string; role?: string; department?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.department) query.set('department', params.department);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ users: User[]; total: number }>(`/users${queryString}`);
  },

  // Notifications
  getNotifications: () =>
    request<{ notifications: Notification[]; unreadCount: number }>('/notifications'),

  markNotificationAsRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllNotificationsAsRead: () =>
    request<{ success: boolean }>('/notifications/mark-all-read', {
      method: 'POST',
    }),
};
