import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import {
  FolderKanban,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Users,
  Plus,
  Trash2,
  Edit,
  UserPlus,
  CheckSquare,
  Clock,
  Layers,
} from 'lucide-react';
import { api } from '../api/client.js';
import { Project, Task, User, TaskStatus } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Badge } from '../components/common/Badge.js';
import { Modal } from '../components/common/Modal.js';
import { Skeleton } from '../components/common/Skeleton.js';
import { ProjectModal } from '../components/projects/ProjectModal.js';

interface OutletContextType {
  openNewTaskModal: (status?: TaskStatus, projectId?: string) => void;
  openEditTaskModal: (task: Task) => void;
  handleSelectTask: (taskId: string) => void;
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { openNewTaskModal, handleSelectTask } = useOutletContext<OutletContextType>();

  const [project, setProject] = useState<Project | null>(null);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'members'>('tasks');

  // Edit Project Modal
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Add Member Modal
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedMemberRole, setSelectedMemberRole] = useState('contributor');
  const [submittingMember, setSubmittingMember] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const [projRes, tasksRes, usersRes] = await Promise.all([
        api.getProjectById(projectId),
        api.getTasks({ projectId, limit: 100 }),
        api.getUsers(),
      ]);
      setProject(projRes.project);
      setTaskStats(projRes.taskStats);
      setTasks(tasksRes.tasks);
      setAllUsers(usersRes.users);
    } catch (err: any) {
      showToast(err.message || 'Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  }, [projectId, showToast]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Listen to global data mutations
  useEffect(() => {
    const handleDataMutated = () => fetchProjectDetails();
    window.addEventListener('taskflow:data-mutated', handleDataMutated);
    return () => window.removeEventListener('taskflow:data-mutated', handleDataMutated);
  }, [fetchProjectDetails]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedUserId) return;

    try {
      setSubmittingMember(true);
      await api.addProjectMember(projectId, {
        userId: selectedUserId,
        role: selectedMemberRole,
      });
      showToast('Project member added', 'success');
      setAddMemberModalOpen(false);
      fetchProjectDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to add member', 'error');
    } finally {
      setSubmittingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!projectId) return;
    try {
      await api.removeProjectMember(projectId, userId);
      showToast('Member removed from project', 'success');
      fetchProjectDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove member', 'error');
    }
  };

  if (loading || !project) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const canManage =
    user?.role === 'admin' ||
    project.ownerId === user?._id ||
    project.members.some((m) => m.user?._id === user?._id && m.role === 'manager');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Project Banner Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-extrabold px-3 py-1.5 rounded-xl text-white shadow-sm"
              style={{ backgroundColor: project.color }}
            >
              {project.key}
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {project.name}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Owner: {project.owner?.name || 'Workspace'} · Created{' '}
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                onClick={() => setEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => openNewTaskModal('todo', project._id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {project.description || 'No description provided for this project.'}
        </p>

        {/* Progress Stats Summary */}
        <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {taskStats?.total || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-400 block">In Progress</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {taskStats?.inProgress || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-purple-400 block">In Review</span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {taskStats?.inReview || 0}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Completed</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {taskStats?.completed || 0} ({taskStats?.progress || 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Tasks vs Members */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Project Tasks ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            Team Members ({project.members.length})
          </button>
        </div>

        {/* Tab 1: Tasks */}
        {activeTab === 'tasks' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No tasks created in this project yet.
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => handleSelectTask(task._id)}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="status" status={task.status} className="text-[10px]">
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="priority" priority={task.priority} className="text-[10px]">
                          {task.priority}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {task.assignee?.avatar ? (
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          title={task.assignee.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                          {task.assignee?.name?.slice(0, 1) || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Members */}
        {activeTab === 'members' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Members</h3>
                <p className="text-xs text-slate-400">Team members with authorized project access</p>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={() => setAddMemberModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {project.members.map((member) => (
                <div key={member.user?._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {member.user?.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {member.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {member.user?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{member.user?.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {member.role}
                    </span>

                    {canManage && member.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => member.user && handleRemoveMember(member.user._id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        projectToEdit={project}
        onSuccess={fetchProjectDetails}
      />

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title="Add Project Member"
        description="Select a team member to grant access to this project."
        maxWidth="sm"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              User
            </label>
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">Select a user...</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Role
            </label>
            <select
              value={selectedMemberRole}
              onChange={(e) => setSelectedMemberRole(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="contributor">Contributor (Can view and update tasks)</option>
              <option value="manager">Manager (Can assign and manage project)</option>
              <option value="viewer">Viewer (Read-only)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddMemberModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingMember || !selectedUserId}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
            >
              {submittingMember ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
