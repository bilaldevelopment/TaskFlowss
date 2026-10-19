import React from 'react';
import { TaskPriority, TaskStatus, UserRole } from '../../types/index.js';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'priority' | 'role' | 'default';
  status?: TaskStatus;
  priority?: TaskPriority;
  role?: UserRole;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  status,
  priority,
  role,
  className = '',
}: BadgeProps) {
  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (variant === 'status' || status) {
    const s = status || (typeof children === 'string' ? children.toLowerCase() : '');
    switch (s) {
      case 'todo':
        colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-300 dark:border-slate-700';
        break;
      case 'in_progress':
        colorClasses = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        break;
      case 'in_review':
        colorClasses = 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        break;
      case 'completed':
        colorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        break;
    }
  } else if (variant === 'priority' || priority) {
    const p = priority || (typeof children === 'string' ? children.toLowerCase() : '');
    switch (p) {
      case 'urgent':
        colorClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        break;
      case 'high':
        colorClasses = 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
        break;
      case 'medium':
        colorClasses = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        break;
      case 'low':
        colorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        break;
    }
  } else if (variant === 'role' || role) {
    const r = role || (typeof children === 'string' ? children.toLowerCase() : '');
    switch (r) {
      case 'admin':
        colorClasses = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
        break;
      case 'project_manager':
        colorClasses = 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800';
        break;
      case 'member':
        colorClasses = 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
}
