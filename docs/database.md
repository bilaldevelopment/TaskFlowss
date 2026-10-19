# TaskFlow: Database Design Document

## 1. Schema Specifications (MongoDB / Mongoose)

### 1.1 User Collection (`users`)
```typescript
interface IUser {
  _id: ObjectId;
  name: string;             // required, min 2, max 60
  email: string;            // required, unique, lowercase, indexed
  passwordHash: string;     // required, bcrypt 10 salt rounds (excluded by default)
  role: 'admin' | 'project_manager' | 'member'; // default: 'member'
  avatar?: string;          // URL or initials token
  title?: string;           // e.g. "Senior Frontend Engineer"
  department?: string;      // e.g. "Engineering", "Design", "Product"
  isActive: boolean;        // default: true
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2 Project Collection (`projects`)
```typescript
interface IProject {
  _id: ObjectId;
  name: string;             // required, max 100
  key: string;              // required, uppercase slug (e.g., 'CORE', 'WEB'), unique per workspace
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  owner: ObjectId;          // ref: 'User', required, indexed
  members: Array<{
    user: ObjectId;         // ref: 'User'
    role: 'owner' | 'manager' | 'contributor' | 'viewer';
  }>;
  color: string;            // Hex color code (e.g., '#4F46E5')
  startDate?: Date;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.3 Task Collection (`tasks`)
```typescript
interface ITask {
  _id: ObjectId;
  title: string;            // required, max 200, indexed
  description?: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'completed'; // indexed
  priority: 'low' | 'medium' | 'high' | 'urgent'; // indexed
  project: ObjectId;        // ref: 'Project', required, indexed
  assignee?: ObjectId;      // ref: 'User', indexed
  creator: ObjectId;        // ref: 'User', required
  dueDate?: Date;           // indexed
  tags: string[];           // array of strings
  order: number;            // for Kanban column positioning
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.4 Comment Collection (`comments`)
```typescript
interface IComment {
  _id: ObjectId;
  task: ObjectId;           // ref: 'Task', required, indexed
  author: ObjectId;         // ref: 'User', required
  content: string;          // required, max 2000
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.5 Notification Collection (`notifications`)
```typescript
interface INotification {
  _id: ObjectId;
  recipient: ObjectId;      // ref: 'User', required, indexed
  sender?: ObjectId;        // ref: 'User'
  title: string;
  message: string;
  type: 'task_assigned' | 'status_change' | 'comment_added' | 'deadline_approaching' | 'system';
  read: boolean;            // default: false, indexed
  link?: string;            // deep-link to page/task
  createdAt: Date;
}
```

### 1.6 ActivityLog Collection (`activitylogs`)
```typescript
interface IActivityLog {
  _id: ObjectId;
  task?: ObjectId;          // ref: 'Task', indexed
  project?: ObjectId;       // ref: 'Project', indexed
  user: ObjectId;           // ref: 'User', required, indexed
  action: string;           // 'created', 'updated_status', 'assigned', 'commented', etc.
  details: Record<string, any>;
  createdAt: Date;
}
```

## 2. Indexing Strategy
- `users`: `{ email: 1 }` (unique)
- `projects`: `{ owner: 1 }`, `{ 'members.user': 1 }`
- `tasks`: `{ project: 1, status: 1 }`, `{ assignee: 1 }`, `{ dueDate: 1 }`
- `comments`: `{ task: 1, createdAt: 1 }`
- `notifications`: `{ recipient: 1, read: 1, createdAt: -1 }`
- `activitylogs`: `{ task: 1, createdAt: -1 }`, `{ project: 1, createdAt: -1 }`
