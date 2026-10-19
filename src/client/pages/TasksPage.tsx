import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Calendar,
  AlertCircle,
  Trash2,
  Edit,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Task, Project, User, TaskStatus, TaskPriority } from '../types/index.js';
import { Badge } from '../components/common/Badge.js';
import { ConfirmDialog } from '../components/common/ConfirmDialog.js';
import { useToast } from '../context/ToastContext.js';
import { Skeleton } from '../components/common/Skeleton.js';
import { EmptyState } from '../components/common/EmptyState.js';

interface OutletContextType {
  openNewTaskModal: (status?: TaskStatus, projectId?: string) => void;
  openEditTaskModal: (task: Task) => void;
  handleSelectTask: (taskId: string) => void;
}

export function TasksPage() {
  const { openNewTaskModal, openEditTaskModal, handleSelectTask } =
    useOutletContext<OutletContextType>();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state initialized from query params
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '');
  const [assigneeId, setAssigneeId] = useState(searchParams.get('assigneeId') || '');
  const [overdueOnly, setOverdueOnly] = useState(searchParams.get('overdue') === 'true');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Deletion modal
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getTasks({
        page,
        limit: 15,
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
        projectId: projectId || undefined,
        assigneeId: assigneeId || undefined,
        overdue: overdueOnly ? 'true' : undefined,
        sortBy,
        sortOrder,
      });
      setTasks(res.tasks);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed to load tasks list:', err);
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, projectId, assigneeId, overdueOnly, sortBy, sortOrder, showToast]);

  const fetchMeta = async () => {
    try {
      const [projRes, userRes] = await Promise.all([api.getProjects(), api.getUsers()]);
      setProjects(projRes.projects);
      setUsers(userRes.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Listen to global data mutations
  useEffect(() => {
    const handleDataMutated = () => fetchTasks();
    window.addEventListener('taskflow:data-mutated', handleDataMutated);
    return () => window.removeEventListener('taskflow:data-mutated', handleDataMutated);
  }, [fetchTasks]);

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      await api.deleteTask(taskToDelete._id);
      showToast('Task deleted successfully', 'success');
      setTaskToDelete(null);
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Task Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {total} tasks tracked across your projects
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openNewTaskModal('todo', projectId || undefined)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, description or tag..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Project */}
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee */}
          <select
            value={assigneeId}
            onChange={(e) => {
              setAssigneeId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Assignees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Overdue Checkbox */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => {
                setOverdueOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Overdue only</span>
          </label>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th
                  onClick={() => handleSortToggle('title')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Task Title</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Project</th>
                <th
                  onClick={() => handleSortToggle('status')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle('priority')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Assignee</th>
                <th
                  onClick={() => handleSortToggle('dueDate')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="p-4">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <EmptyState
                      icon={CheckSquare}
                      title="No tasks match your criteria"
                      description="Try clearing your filters or create a new task for your project backlog."
                      action={{
                        label: 'Create Task',
                        onClick: () => openNewTaskModal('todo', projectId || undefined),
                      }}
                    />
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => handleSelectTask(task._id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Title & Tags */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {task.title}
                      </div>
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Project */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {task.project ? (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: task.project.color }}
                        >
                          {task.project.key}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="status" status={task.status}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="priority" priority={task.priority}>
                        {task.priority}
                      </Badge>
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {task.assignee?.avatar ? (
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : task.assignee?.name ? (
                          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                            {task.assignee.name.slice(0, 1)}
                          </div>
                        ) : null}
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {task.assignee?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {task.dueDate ? (
                        <div
                          className={`flex items-center gap-1.5 font-medium ${
                            task.isOverdue
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {task.isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                          <span>
                            {new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTaskModal(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit task"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskToDelete(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-bold text-slate-900 dark:text-white">{tasks.length}</span>{' '}
            of <span className="font-bold text-slate-900 dark:text-white">{total}</span> tasks
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete Task"
      />
    </div>
  );
}
