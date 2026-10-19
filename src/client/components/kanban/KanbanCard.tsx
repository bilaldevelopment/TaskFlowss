import React from 'react';
import {
  Calendar,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  MoreVertical,
} from 'lucide-react';
import { Task, TaskStatus } from '../../types/index.js';
import { Badge } from '../common/Badge.js';

interface KanbanCardProps {
  task: Task;
  onSelect: (taskId: string) => void;
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanCard({ task, onSelect, onMoveStatus }: KanbanCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'completed'];
  const currentIndex = statusOrder.indexOf(task.status);
  const prevStatus = currentIndex > 0 ? statusOrder[currentIndex - 1] : null;
  const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : null;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(task._id)}
      className="group bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top Header: Project Key & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {task.project && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white shadow-2xs"
              style={{ backgroundColor: task.project.color }}
            >
              {task.project.key}
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[90px]">
            {task._id.slice(-6)}
          </span>
        </div>

        <Badge variant="priority" priority={task.priority} className="text-[10px] px-1.5 py-0">
          {task.priority}
        </Badge>
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed mb-2.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {task.title}
      </h4>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-[10px] text-slate-400">+{task.tags.length - 2}</span>
          )}
        </div>
      )}

      {/* Bottom Row: Due date, comments, assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2.5">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 font-medium ${
                task.isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}

          {typeof task.commentsCount === 'number' && task.commentsCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {task.commentsCount}
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        <div className="flex items-center gap-1">
          {task.assignee?.avatar ? (
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name}
              title={task.assignee.name}
              className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : task.assignee?.name ? (
            <div
              title={task.assignee.name}
              className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold"
            >
              {task.assignee.name.slice(0, 1)}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 italic">Unassigned</span>
          )}
        </div>
      </div>

      {/* Quick Move Buttons for Keyboard / Quick Accessibility */}
      <div
        className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled={!prevStatus}
          onClick={() => prevStatus && onMoveStatus(task._id, prevStatus)}
          className="flex items-center text-[10px] font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
          title={prevStatus ? `Move back to ${prevStatus}` : 'At start'}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Back
        </button>

        <button
          type="button"
          disabled={!nextStatus}
          onClick={() => nextStatus && onMoveStatus(task._id, nextStatus)}
          className="flex items-center text-[10px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
          title={nextStatus ? `Advance to ${nextStatus}` : 'Completed'}
        >
          Advance <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
