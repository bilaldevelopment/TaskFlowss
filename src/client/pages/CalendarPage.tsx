import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertCircle,
  FolderKanban,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Task, TaskStatus } from '../types/index.js';
import { Badge } from '../components/common/Badge.js';

interface OutletContextType {
  openNewTaskModal: (status?: TaskStatus, projectId?: string) => void;
  handleSelectTask: (taskId: string) => void;
}

export function CalendarPage() {
  const { openNewTaskModal, handleSelectTask } = useOutletContext<OutletContextType>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const fetchCalendarTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getTasks({ limit: 100 });
      setTasks(res.tasks.filter((t) => !!t.dueDate));
    } catch (err) {
      console.error('Failed to load calendar tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  // Calendar math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map tasks by day of month
  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach((t) => {
    if (!t.dueDate) return;
    const d = new Date(t.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      if (!tasksByDay[dayNum]) tasksByDay[dayNum] = [];
      tasksByDay[dayNum].push(t);
    }
  });

  const now = new Date();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Deadline Calendar
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track delivery milestones and upcoming deliverables
            </p>
          </div>
        </div>

        {/* Month Navigation & Today */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={today}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-900 dark:text-white min-w-32 text-center">
              {monthName}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/60 min-h-[500px]">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50/50 dark:bg-slate-950/20 p-2 min-h-24" />
          ))}

          {/* Month Day Cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              now.getFullYear() === year && now.getMonth() === month && now.getDate() === dayNum;
            const dayTasks = tasksByDay[dayNum] || [];

            return (
              <div
                key={`day-${dayNum}`}
                className={`p-2 min-h-24 flex flex-col justify-between transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30 ${
                  isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/15' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Day Tasks List */}
                <div className="mt-1 space-y-1 overflow-y-auto max-h-24">
                  {dayTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => handleSelectTask(task._id)}
                      className="px-2 py-1 rounded-md text-[11px] font-semibold text-white truncate cursor-pointer shadow-2xs hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: task.project?.color || '#4F46E5',
                      }}
                      title={`${task.title} (${task.priority})`}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
