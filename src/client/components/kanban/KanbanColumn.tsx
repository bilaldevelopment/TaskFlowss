import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../../types/index.js';
import { KanbanCard } from './KanbanCard.js';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  colorBadgeClass: string;
  onSelectTask: (taskId: string) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
  onMoveStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddNewTask: (status: TaskStatus) => void;
}

export function KanbanColumn({
  status,
  title,
  tasks,
  colorBadgeClass,
  onSelectTask,
  onDropTask,
  onMoveStatus,
  onAddNewTask,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only leave if exiting the target
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border transition-all min-h-[550px] w-80 shrink-0 ${
        isOver
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${colorBadgeClass}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title}
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddNewTask(status)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Column Cards Dropzone */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl text-center p-4">
            <p className="text-xs text-slate-400">Drag tasks here or click +</p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              onSelect={onSelectTask}
              onMoveStatus={onMoveStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
