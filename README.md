# TaskFlow — Modern SaaS Project & Task Management System

TaskFlow is a high-performance, full-stack project and task management system engineered for high-velocity teams, student projects, engineering cohorts, and project managers. Built with React 19, TypeScript, Express.js, and MongoDB / Mongoose ODM patterns, it pairs an interface with server-side authorization, drag-and-drop Kanban state synchronization, and live sprint analytics.

---

## 1. Features

### Core Capabilities
- **Real-Time Kanban Board**: 4-column drag-and-drop task board (`To Do`, `In Progress`, `In Review`, `Completed`) with immediate server persistence, task count badges, priority tags, and accessible keyboard-friendly quick advancement controls.
- **Task Management & Table View**: Comprehensive CRUD with multi-criteria filtering (by project, status, priority, assignee, overdue status), title/description search, column sorting, and pagination.
- **Sprint & Project Portfolios**: Track project milestones, custom project keys (e.g. `MOB`, `OPS`, `PORT`), color branding, member access control, and automatic percentage completion calculations.
- **Real-Time Database Analytics**: Interactive Recharts graphs displaying real database metrics — status distribution donuts, priority bar charts, upcoming 14-day deadlines countdown, and personal sprint focus counts.
- **Interactive Task Detail Drawer**: In-depth task inspection, status updates, metadata grids, threaded comment discussions, and historical activity audit logs.
- **Deadline Calendar**: Monthly interactive view plotting task milestones on due dates, with month navigation and quick-view task launchers.
- **Team Directory & Workload Allocation**: Workspace member directory showcasing roles, departments, avatars, contact emails, and live assigned vs completed workload counters.
- **In-App Notification Center**: Unread alert counters and notifications triggered on task assignments, status progressions, and comment replies.
- **Role-Based Access Control (RBAC)**: Enforced server-side across `Admin`, `Project Manager`, and `Member` personas with IDOR mitigation.
- **Dual Visual Theme**: Unified Light and Dark mode using Tailwind CSS tokens and zero-flash persistence.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 SPA with Vite
- **Language**: TypeScript (strict typings throughout)
- **Styling**: Tailwind CSS v4 with dark/light theme support
- **State & Server Cache**: TanStack Query v5
- **Routing**: React Router v7 (`react-router-dom`)
- **Icons**: Lucide React
- **Analytics Visualization**: Recharts (Pie, Bar, Tooltips)
- **Validation**: Zod & React Form schemas

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript executed via `tsx`
- **Architecture**: Versioned RESTful API under `/api/v1`
- **Authentication**: JWT (JSON Web Tokens) with HMAC SHA-256 signing
- **Security**: BCrypt password hashing (10 salt rounds), CORS, cookie-parser, input validation middleware
- **Data Access**: MongoDB with Mongoose ODM support, coupled with an embedded persistent file-backed document store for zero-dependency execution in air-gapped or preview environments

### Testing & Tooling
- **Test Runner**: Vitest
- **API Testing**: Supertest
- **Linting & Type Checking**: TypeScript compiler (`tsc --noEmit`)

---

## 3. Architecture Overview

```
taskflow/
├── src/
│   ├── client/                  # React SPA Frontend
│   │   ├── api/                 # API client with JWT bearer tokens
│   │   ├── components/          # Reusable UI modules
│   │   │   ├── common/          # Badge, Modal, ConfirmDialog, Skeleton, EmptyState
│   │   │   ├── kanban/          # KanbanBoard, KanbanColumn, KanbanCard
│   │   │   ├── layout/          # Navbar, Sidebar, AppLayout, NotificationDropdown
│   │   │   ├── projects/        # ProjectModal
│   │   │   └── tasks/           # TaskModal, TaskDetailDrawer
│   │   ├── context/             # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/               # Landing, Login, Register, Dashboard, Kanban, etc.
│   │   └── types/               # TypeScript interfaces
│   └── server/                  # Express RESTful Backend
│       ├── config/              # Environment variable configurations
│       ├── controllers/         # Auth, Project, Task, Comment, Analytics, User
│       ├── db/                  # Document database engine, types, and seed loader
│       ├── middleware/          # JWT authentication, RBAC, Zod validation, Error handler
│       ├── routes/              # Versioned API route definitions (/api/v1/*)
│       └── utils/               # BCrypt password hashing, JWT signing
├── docs/                        # Requirements, architecture, database, & API docs
├── tests/                       # Vitest and Supertest automated test suites
├── server.ts                    # Full-stack entry point (Express + Vite SPA middleware)
└── package.json                 # Project configuration & npm scripts
```

---

## 4. Demo Credentials

TaskFlow comes pre-seeded with realistic team members and active project workloads. You can use the 1-click fill buttons on `/login` or enter the credentials below:

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | Alex Rivers | `alex.admin@taskflow.dev` | `TaskFlow2026!` |
| **Project Manager** | Sarah Chen | `sarah.pm@taskflow.dev` | `TaskFlow2026!` |
| **Team Member** | David Kim | `david.dev@taskflow.dev` | `TaskFlow2026!` |

---

## 5. Getting Started & Local Installation

### Prerequisites
- Node.js 18+ (tested on Node v20 & v22)
- npm or yarn

### Installation Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

---

## 6. Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server listening port | `3000` |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` |
| `JWT_SECRET` | Secret key for signing and verifying JWT tokens | `taskflow_jwt_secure_development_secret_key_2026` |
| `MONGODB_URI` | MongoDB Atlas or local MongoDB connection string | *(Optional: defaults to persistent local store)* |
| `CLIENT_ORIGIN`| Allowed CORS origin for standalone API deployments | `http://localhost:3000` |

---

## 7. Available Scripts

- `npm run dev`: Boots the full-stack server running Express and Vite middleware concurrently on port 3000.
- `npm run build`: Generates optimized production client assets in `/dist`.
- `npm run start`: Starts the production Express server serving the static build and REST API.
- `npm run test`: Executes the automated Vitest & Supertest API suite.
- `npm run lint`: Performs type checking across frontend and backend codebases.

---

## 8. Deployment Guide

### Option 1: Unified Full-Stack (Render / Railway / Cloud Run)
1. Set the build command: `npm run build`
2. Set the start command: `npm start`
3. Configure `PORT=3000`, `NODE_ENV=production`, and `JWT_SECRET`.
4. (Optional) Provide `MONGODB_URI` pointing to MongoDB Atlas.

### Option 2: Split Frontend (Vercel) + Backend (Node.js)
1. Deploy `src/server` to Render or Railway. Set `CLIENT_ORIGIN` to your Vercel domain.
2. Deploy the Vite React app to Vercel, pointing `VITE_API_URL` to the backend URL.

---

## 9. Security & Authorization Design

- **BCrypt Hashing**: Passwords stored using 10 rounds of cryptographic salting; sensitive fields are stripped prior to response transmission.
- **Scoped Database Queries**: Data is filtered by workspace and project membership at the controller layer; unauthorized project tasks cannot be fetched or mutated.
- **Centralized Error Handling**: Detailed stack traces are suppressed in production mode to prevent information leakage.
- **Request Sanitization**: All incoming request bodies and parameters are validated using Zod schemas before reaching business logic.

---

## 10. Known Limitations

- **File Attachments**: Uploading large binary file attachments to tasks currently accepts external asset URLs rather than S3 bucket multipart uploads.
- **Real-Time WebSockets**: Currently uses 30-second polling for background notifications; future iterations can integrate Socket.IO or Server-Sent Events (SSE).
