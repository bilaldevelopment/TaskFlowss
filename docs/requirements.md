# TaskFlow: Requirements Document

## 1. Executive Summary
TaskFlow is a production-grade project and task management SaaS system engineered for internship teams, university labs, fast-moving startups, and project managers. It delivers real-time visibility into project lifecycles, team allocation, deadline tracking, and sprint metrics.

## 2. Target Users & Personas
- **Admin**: Complete workspace visibility, team directory management, global audit logs, and workspace configuration.
- **Project Manager**: Project lifecycle ownership, task assignment, sprint velocity tracking, member access assignment.
- **Team Member / Intern**: Focused task execution, status progression (Kanban / List), comment collaboration, deadline calendar.

## 3. Core Functional Requirements
1. **Authentication & Authorization**:
   - Secure registration, login, logout, profile update.
   - BCrypt password hashing (minimum 10 salt rounds).
   - JWT authentication stored securely in HTTP-only cookies or Bearer Authorization headers.
   - Role-Based Access Control (RBAC) enforced on every API route.
   - Session restoration on page reload.
2. **Project Management**:
   - Create, read, update, delete projects.
   - Custom project keys (e.g., `PRJ`, `DEV`, `MKT`), color branding, and target milestones.
   - Membership authorization: only project members/managers/admins can inspect or modify private project data.
3. **Task Management**:
   - Comprehensive CRUD for tasks with title, rich description, priority (`low`, `medium`, `high`, `urgent`), status (`todo`, `in_progress`, `in_review`, `completed`), due dates, estimated hours, and tags.
   - List/Table view with multi-criteria filtering (status, priority, assignee, search, sorting).
   - Drag-and-drop & quick-action Kanban board with persistent status synchronization.
   - Overdue calculation based on current date vs. task due date.
4. **Interactive Collaboration & Activity**:
   - Threaded comments on tasks with timestamps and author metadata.
   - Automated activity log tracking (creation, status changes, assignments, edits).
   - In-app notification center for assignments, status changes, and approaching deadlines.
5. **Analytics & Performance Dashboard**:
   - Real-time aggregation of task status distribution, priority breakdown, completion rate, overdue tasks count, and team workload distribution.
   - Interactive charts powered by Recharts.
6. **Calendar & Deadline View**:
   - Monthly calendar grid rendering task deadlines, with quick-view modal and navigation.

## 4. Non-Functional Requirements
- **Performance**: Sub-100ms API response time, zero lag in UI interactions.
- **Security**: OWASP Top 10 mitigation, parameter validation via Zod, rate limiting, sanitization, least-privilege data scoping.
- **Accessibility**: Keyboard navigable, WCAG AA color contrast, visible focus rings, ARIA roles.
- **Theme**: Unified Dark and Light modes using modern Tailwind CSS tokens.
