import { Task, TaskStatus } from '../../types/index.js';
import { KanbanColumn } from './KanbanColumn.js';

interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, targetStatus: TaskStatus) => void;
  onAddNewTask: (status: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onAddNewTask,
}: KanbanBoardProps) {
  const columns: Array<{
    status: TaskStatus;
    title: string;
    colorBadge: string;
  }> = [
    { status: 'todo', title: 'To Do', colorBadge: 'bg-slate-400' },
    { status: 'in_progress', title: 'In Progress', colorBadge: 'bg-blue-500' },
    { status: 'in_review', title: 'In Review', colorBadge: 'bg-purple-500' },
    { status: 'completed', title: 'Completed', colorBadge: 'bg-emerald-500' },
  ];

  return (
    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 select-none">
      {columns.map((col) => {
        const colTasks = tasks
          .filter((t) => t.status === col.status)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        return (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            colorBadgeClass={col.colorBadge}
            tasks={colTasks}
            onSelectTask={onSelectTask}
            onDropTask={onUpdateStatus}
            onMoveStatus={onUpdateStatus}
            onAddNewTask={onAddNewTask}
          />
        );
      })}
    </div>
  );
}
