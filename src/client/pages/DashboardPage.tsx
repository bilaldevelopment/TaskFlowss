import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderKanban,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { api } from '../api/client.js';
import { DashboardMetrics, Project } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Badge } from '../components/common/Badge.js';
import { Skeleton } from '../components/common/Skeleton.js';

interface OutletContextType {
  openNewTaskModal: (status?: string, projectId?: string) => void;
  openEditTaskModal: (task: any) => void;
  handleSelectTask: (taskId: string) => void;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { openNewTaskModal, handleSelectTask } = useOutletContext<OutletContextType>();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, projectsRes] = await Promise.all([
        api.getDashboardAnalytics(selectedProjectId || undefined),
        api.getProjects(),
      ]);
      setMetrics(analyticsRes);
      setProjects(projectsRes.projects);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Listen for global data mutations
  useEffect(() => {
    const handleDataMutated = () => fetchDashboardData();
    window.addEventListener('taskflow:data-mutated', handleDataMutated);
    return () => window.removeEventListener('taskflow:data-mutated', handleDataMutated);
  }, [fetchDashboardData]);

  const kpis = [
    {
      label: 'Total Tasks',
      value: metrics?.metrics.totalTasks ?? 0,
      icon: Layers,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      label: 'Completed',
      value: metrics?.metrics.completedTasks ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      label: 'In Progress',
      value: metrics?.metrics.inProgressTasks ?? 0,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      label: 'Overdue',
      value: metrics?.metrics.overdueTasks ?? 0,
      icon: AlertCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/60',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Here is your live sprint overview and team workload distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-2xs"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => openNewTaskModal('todo', selectedProjectId || undefined)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))
          : kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {kpi.label}
                    </span>
                    <div className={`p-2 rounded-xl ${kpi.bgColor} ${kpi.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {kpi.value}
                    </span>
                    {kpi.label === 'Completed' && metrics && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {metrics.metrics.completionRate}% Done
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
      </div>

      {/* "My Work" Highlight Banner */}
      {metrics?.myWork && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Your Personal Sprint Focus</h3>
              <p className="text-xs text-indigo-200/80">
                You have {metrics.myWork.pending} active tasks assigned to you (
                {metrics.myWork.overdue > 0 ? (
                  <span className="text-rose-300 font-bold">{metrics.myWork.overdue} overdue</span>
                ) : (
                  'none overdue'
                )}
                ).
              </p>
            </div>
          </div>

          <Link
            to={`/tasks?assigneeId=${user?._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors self-start sm:self-auto"
          >
            <span>View My Work</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Charts Section: Status Breakdown & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Donut Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Task Status Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribution across Kanban lifecycle
              </p>
            </div>
            <Link
              to="/kanban"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Open Kanban <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading || !metrics ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-48 w-48 rounded-full" />
            </div>
          ) : (
            <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={metrics.statusDistribution}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {metrics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0 sm:ml-4 shrink-0">
                {metrics.statusDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Workload by Priority
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Urgency levels across assigned backlog
              </p>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              All Tasks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading || !metrics ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={metrics.priorityDistribution}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {metrics.priorityDistribution.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Upcoming Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Upcoming Deadlines (Next 14 Days)
            </h3>
            <Link
              to="/calendar"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Calendar
            </Link>
          </div>

          {metrics?.upcomingDeadlines.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No upcoming deadlines in the next 14 days!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {metrics?.upcomingDeadlines.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleSelectTask(task._id)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.project && (
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.2 rounded text-white"
                          style={{ backgroundColor: task.project.color }}
                        >
                          {task.project.name}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        Assignee: {task.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <Badge variant="priority" priority={task.priority} className="text-[10px]">
                      {task.priority}
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mt-1">
                      {new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Audit Feed */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Recent Team Activity
            </h3>
            <span className="text-xs text-slate-400">Audit Log</span>
          </div>

          {metrics?.recentActivity.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No recorded team activity yet.
            </div>
          ) : (
            <div className="space-y-3">
              {metrics?.recentActivity.map((log) => (
                <div key={log._id} className="flex items-start gap-3 text-xs">
                  {log.user?.avatar ? (
                    <img
                      src={log.user.avatar}
                      alt={log.user.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {log.user?.name?.slice(0, 1) || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {log.user?.name || 'User'}
                      </span>{' '}
                      {log.action.replace('_', ' ')}
                      {log.details?.title && (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                          {' '}
                          "{log.details.title}"
                        </span>
                      )}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      · {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
