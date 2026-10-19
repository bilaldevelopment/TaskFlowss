import { useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { Navbar } from './Navbar.js';
import { TaskModal } from '../tasks/TaskModal.js';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer.js';
import { Task, TaskStatus } from '../../types/index.js';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Global Task Modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');
  const [initialProjectId, setInitialProjectId] = useState<string | undefined>(undefined);

  // Global Task Detail Drawer state
  const activeTaskId = searchParams.get('taskId');

  const openNewTaskModal = (status: TaskStatus = 'todo', projectId?: string) => {
    setTaskToEdit(null);
    setInitialStatus(status);
    setInitialProjectId(projectId);
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  const handleSelectTask = (taskId: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('taskId', taskId);
    setSearchParams(newParams);
  };

  const handleCloseTaskDrawer = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('taskId');
    setSearchParams(newParams);
  };

  const handleTaskMutationSuccess = () => {
    // Custom event to trigger re-fetches in pages
    window.dispatchEvent(new CustomEvent('taskflow:data-mutated'));
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenNewTaskModal={() => openNewTaskModal('todo')}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenNewTaskModal={() => openNewTaskModal('todo')}
          onTaskSelect={handleSelectTask}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet
            context={{
              openNewTaskModal,
              openEditTaskModal,
              handleSelectTask,
            }}
          />
        </main>
      </div>

      {/* Global Task Creation & Edit Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        initialStatus={initialStatus}
        initialProjectId={initialProjectId}
        onSuccess={handleTaskMutationSuccess}
      />

      {/* Global Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={activeTaskId}
        onClose={handleCloseTaskDrawer}
        onEdit={(task) => {
          handleCloseTaskDrawer();
          openEditTaskModal(task);
        }}
        onTaskUpdated={handleTaskMutationSuccess}
        onTaskDeleted={handleTaskMutationSuccess}
      />
    </div>
  );
}
