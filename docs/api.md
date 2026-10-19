# TaskFlow: RESTful API Specifications

All endpoints are versioned under `/api/v1`. Authenticated routes require an `Authorization: Bearer <token>` header or `token` HTTP-only cookie.

## 1. Authentication Endpoints

### POST `/api/v1/auth/register`
- **Body**: `{ name: string, email: string, password: string, role?: string }`
- **Response 201**: `{ user: IUser, token: string }`
- **Errors**: 400 (Validation failed), 409 (Email already registered)

### POST `/api/v1/auth/login`
- **Body**: `{ email: string, password: string }`
- **Response 200**: `{ user: IUser, token: string }`
- **Errors**: 401 (Invalid credentials)

### POST `/api/v1/auth/logout`
- **Response 200**: `{ message: 'Logged out successfully' }`

### GET `/api/v1/auth/me`
- **Header**: Bearer JWT
- **Response 200**: `{ user: IUser }`

### PATCH `/api/v1/auth/profile`
- **Body**: `{ name?: string, title?: string, department?: string, avatar?: string }`
- **Response 200**: `{ user: IUser }`

### POST `/api/v1/auth/change-password`
- **Body**: `{ currentPassword: string, newPassword: string }`
- **Response 200**: `{ message: 'Password updated successfully' }`

## 2. Project Endpoints

### GET `/api/v1/projects`
- **Query**: `?search=&status=&page=1&limit=20`
- **Response 200**: `{ projects: IProject[], total: number }`

### POST `/api/v1/projects`
- **Body**: `{ name: string, key: string, description?: string, color?: string, targetDate?: string }`
- **Response 201**: `{ project: IProject }`

### GET `/api/v1/projects/:projectId`
- **Response 200**: `{ project: IProject, taskStats: object, members: IUser[] }`

### PATCH `/api/v1/projects/:projectId`
- **Body**: `{ name?: string, description?: string, status?: string, color?: string, targetDate?: string }`
- **Response 200**: `{ project: IProject }`

### DELETE `/api/v1/projects/:projectId`
- **Response 200**: `{ message: 'Project deleted' }`

## 3. Task Endpoints

### GET `/api/v1/tasks`
- **Query**: `?projectId=&status=&priority=&assignee=&search=&overdue=&sortBy=&sortOrder=&page=&limit=`
- **Response 200**: `{ tasks: ITask[], total: number, page: number, totalPages: number }`

### POST `/api/v1/tasks`
- **Body**: `{ title: string, description?: string, projectId: string, assigneeId?: string, priority?: string, status?: string, dueDate?: string, tags?: string[], estimatedHours?: number }`
- **Response 201**: `{ task: ITask }`

### GET `/api/v1/tasks/:taskId`
- **Response 200**: `{ task: ITask, comments: IComment[], activity: IActivityLog[] }`

### PATCH `/api/v1/tasks/:taskId`
- **Body**: `{ title?: string, description?: string, status?: string, priority?: string, assigneeId?: string, dueDate?: string, tags?: string[], estimatedHours?: number, actualHours?: number, order?: number }`
- **Response 200**: `{ task: ITask }`

### DELETE `/api/v1/tasks/:taskId`
- **Response 200**: `{ message: 'Task deleted' }`

### POST `/api/v1/tasks/:taskId/comments`
- **Body**: `{ content: string }`
- **Response 201**: `{ comment: IComment }`

## 4. Analytics & Team Endpoints

### GET `/api/v1/analytics/dashboard`
- **Query**: `?projectId=&timeframe=30d`
- **Response 200**: Metrics containing totalTasks, completedTasks, inProgressTasks, overdueTasks, completionRate, priorityDistribution, statusBreakdown, weeklyActivity, upcomingDeadlines

### GET `/api/v1/users`
- **Query**: `?search=&role=`
- **Response 200**: `{ users: IUser[] }`

### GET `/api/v1/notifications`
- **Response 200**: `{ notifications: INotification[], unreadCount: number }`

### PATCH `/api/v1/notifications/:id/read`
- **Response 200**: `{ success: true }`

### POST `/api/v1/notifications/mark-all-read`
- **Response 200**: `{ success: true }`
