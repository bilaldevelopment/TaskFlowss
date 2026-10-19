import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Filter, Kanban, RefreshCw } from 'lucide-react';
import { KanbanBoard } from '../components/kanban/KanbanBoard.js';
import { api } from '../api/client.js';
import { Task, Project, TaskStatus } from '../types/index.js';
import { useToast } from '../context/ToastContext.js';
import { Skeleton } from '../components/common/Skeleton.js';

interface OutletContextType {
  openNewTaskModal: (status?: TaskStatus, projectId?: string) => void;
  openEditTaskModal: (task: Task) => void;
  handleSelectTask: (taskId: string) => void;
}

export function KanbanPage() {
  const { openNewTaskModal, handleSelectTask } = useOutletContext<OutletContextType>();
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  const fetchKanbanData = useCallback(async () => {
    try {
      setLoading(true);
      const [taskRes, projRes] = await Promise.all([
        api.getTasks({
          projectId: selectedProjectId || undefined,
          search: searchQuery || undefined,
          priority: selectedPriority || undefined,
          limit: 100,
        }),
        api.getProjects(),
      ]);
      setTasks(taskRes.tasks);
      setProjects(projRes.projects);
    } catch (err) {
      console.error('Failed to load Kanban tasks:', err);
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, searchQuery, selectedPriority, showToast]);

  useEffect(() => {
    fetchKanbanData();
  }, [fetchKanbanData]);

  // Listen to global mutations (e.g. from task drawer)
  useEffect(() => {
    const handleDataMutated = () => fetchKanbanData();
    window.addEventListener('taskflow:data-mutated', handleDataMutated);
    return () => window.removeEventListener('taskflow:data-mutated', handleDataMutated);
  }, [fetchKanbanData]);

  // Handle Drag-and-drop or accessible advance/back
  const handleUpdateStatus = async (taskId: string, targetStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await api.updateTask(taskId, { status: targetStatus });
      showToast(`Task moved to ${targetStatus.replace('_', ' ')}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to move task', 'error');
      // Revert on error
      fetchKanbanData();
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Kanban Board
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drag cards or use arrows to update sprint progress in real time
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter cards..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
            />
          </div>

          {/* Project selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>

          {/* Priority selector */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Refresh button */}
          <button
            type="button"
            onClick={fetchKanbanData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh board"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Add Task button */}
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

      {/* Kanban Board Container */}
      {loading && tasks.length === 0 ? (
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-80 shrink-0 h-[500px] rounded-2xl bg-slate-100 dark:bg-slate-900/40 p-4 border border-slate-200 dark:border-slate-800"
            >
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          onSelectTask={handleSelectTask}
          onUpdateStatus={handleUpdateStatus}
          onAddNewTask={(status) => openNewTaskModal(status, selectedProjectId || undefined)}
        />
      )}
    </div>
  );
}
