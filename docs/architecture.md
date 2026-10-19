# TaskFlow: System Architecture Document

## 1. High-Level Architecture Overview
TaskFlow is designed as a unified full-stack TypeScript application utilizing modern SPA + Express REST API architecture, packaged cleanly for rapid local execution and elastic cloud deployment.

```
+--------------------------------------------------------------------+
|                         Client (React 19)                          |
|  +---------------------------------------------------------------+ |
|  | Pages: Landing, Auth, Dashboard, Tasks, Kanban, Projects,     | |
|  |        Calendar, Team, Settings, Notifications                | |
|  +---------------------------------------------------------------+ |
|  | Components: UI Kit, Sidebar, Header, Modals, TaskCard, Charts | |
|  +---------------------------------------------------------------+ |
|  | State: TanStack Query v5 + Context (Auth, Theme)              | |
+--------------------------------------------------------------------+
                                  |
                      HTTP / JSON (REST API)
                     Bearer JWT / Cookie Auth
                                  v
+--------------------------------------------------------------------+
|                         Server (Express.js)                        |
|  +---------------------------------------------------------------+ |
|  | Middlewares: Helmet, CORS, Rate Limit, Auth, RBAC, Validation  | |
|  +---------------------------------------------------------------+ |
|  | Controllers: Auth, Projects, Tasks, Comments, Analytics, Users | |
|  +---------------------------------------------------------------+ |
|  | Services: Activity Logger, Notification Engine, RBAC Verifier | |
|  +---------------------------------------------------------------+ |
|  | Models & Data Layer: Mongoose ODM + Persistent Storage Store   | |
+--------------------------------------------------------------------+
                                  |
                                  v
+--------------------------------------------------------------------+
|                  Database Layer (MongoDB / Mongoose)               |
|  +---------------------------------------------------------------+ |
|  | Collections: users, projects, tasks, comments,                | |
|  |              notifications, activitylogs                      | |
+--------------------------------------------------------------------+
```

## 2. Directory Structure
```
├── docs/                     # Specifications and architectural docs
├── src/
│   ├── client/               # React SPA Frontend
│   │   ├── api/              # API clients & TanStack Query hooks
│   │   ├── components/       # Reusable UI & domain components
│   │   │   ├── layout/       # Sidebar, TopNav, AppLayout, PageContainer
│   │   │   ├── kanban/       # KanbanBoard, KanbanColumn, KanbanCard
│   │   │   ├── tasks/        # TaskModal, TaskFilters, TaskTable
│   │   │   ├── dashboard/    # MetricCard, ProductivityCharts, ActivityFeed
│   │   │   ├── common/       # Button, Input, Modal, Badge, Dropdown
│   │   ├── context/          # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/            # Landing, Login, Register, Dashboard, etc.
│   │   └── types/            # Shared TypeScript frontend interfaces
│   ├── server/               # Express Backend
│   │   ├── config/           # Environment & security configurations
│   │   ├── controllers/      # Route handler logic
│   │   ├── middleware/       # Auth JWT, RBAC, Zod validation, error handler
│   │   ├── models/           # Mongoose schemas & data access abstraction
│   │   ├── routes/           # Versioned routes (/api/v1/*)
│   │   ├── services/         # Activity log, notifications, seeds
│   │   └── utils/            # Token generation, password hashing, error helpers
├── server.ts                 # Full-stack server entry point (Express + Vite)
├── tests/                    # Vitest unit & integration tests
```

## 3. Security Architecture
- **JWT Authentication**: Signed with HMAC SHA-256 (`JWT_SECRET`), expiring in 7 days.
- **BCrypt Hashing**: Passwords stored as 10-round salted hashes. Never stored or returned in responses.
- **Resource Authorization**: Every task, project, and comment operation verifies whether the requesting user is the owner, project manager, or workspace admin.
- **Validation**: Strict Zod schemas sanitize and validate query params, URL parameters, and payloads before hitting controllers.
- **Error Sanitization**: Centralized error middleware ensures no sensitive stack traces are disclosed.
