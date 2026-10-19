import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User as UserIcon,
  FolderKanban,
  Tag,
  MessageSquare,
  History,
  Send,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Task, Comment, ActivityLog, TaskStatus } from '../../types/index.js';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Badge } from '../common/Badge.js';
import { ConfirmDialog } from '../common/ConfirmDialog.js';

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

export function TaskDetailDrawer({
  taskId,
  onClose,
  onEdit,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailDrawerProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

  useEffect(() => {
    if (taskId) {
      loadTaskDetails(taskId);
    } else {
      setTask(null);
    }
  }, [taskId]);

  const loadTaskDetails = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.getTaskById(id);
      setTask(res.task);
      setComments(res.comments);
      setActivity(res.activity);
    } catch (err: any) {
      showToast(err.message || 'Failed to load task details', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    try {
      const res = await api.updateTask(task._id, { status: newStatus });
      setTask(res.task);
      onTaskUpdated();
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success');
      loadTaskDetails(task._id); // Reload activity
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !commentContent.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await api.createComment(task._id, commentContent.trim());
      setComments((prev) => [...prev, res.comment]);
      setCommentContent('');
      showToast('Comment posted', 'success');
      loadTaskDetails(task._id); // Refresh activity
    } catch (err: any) {
      showToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      showToast('Comment deleted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete comment', 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    try {
      await api.deleteTask(task._id);
      showToast('Task deleted successfully', 'success');
      setDeleteConfirmOpen(false);
      onClose();
      onTaskDeleted();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  if (!taskId) return null;

  const canDeleteTask =
    user?.role === 'admin' ||
    task?.creatorId === user?._id;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
          onClick={onClose}
        />

        {/* Drawer slide-in panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
          <div className="w-screen max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                {task?.project && (
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-md text-white shadow-xs"
                    style={{ backgroundColor: task.project.color }}
                  >
                    {task.project.key}
                  </span>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {task?._id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {task && (
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit task"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}

                {canDeleteTask && (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            {loading || !task ? (
              <div className="flex-1 p-6 space-y-4">
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md" />
                <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-md" />
                <div className="h-32 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title & Quick Status selector */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {task.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2.5 mt-3">
                    {/* Status change select */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <Badge variant="priority" priority={task.priority}>
                      {task.priority} Priority
                    </Badge>

                    {task.isOverdue && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                        <AlertCircle className="w-3.5 h-3.5" /> Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Assignee</span>
                    <div className="flex items-center gap-2">
                      {task.assignee?.avatar ? (
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {task.assignee?.name?.slice(0, 1) || '?'}
                        </div>
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {task.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Due Date</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'No deadline'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Project</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.project?.name || 'Workspace'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Estimated Work</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.estimatedHours ? `${task.estimatedHours}h estimated` : 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          <Tag className="w-3 h-3 text-slate-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <div className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {task.description || (
                      <span className="text-slate-400 italic">No description provided.</span>
                    )}
                  </div>
                </div>

                {/* Tabs: Comments vs Activity */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab('comments')}
                      className={`flex items-center gap-2 pb-2.5 text-xs font-bold border-b-2 transition-all ${
                        activeTab === 'comments'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Comments ({comments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('activity')}
                      className={`flex items-center gap-2 pb-2.5 text-xs font-bold border-b-2 transition-all ${
                        activeTab === 'activity'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      <History className="w-4 h-4" />
                      Activity History ({activity.length})
                    </button>
                  </div>

                  {/* Comments Tab */}
                  {activeTab === 'comments' ? (
                    <div className="space-y-4">
                      {/* Comments list */}
                      <div className="space-y-3">
                        {comments.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4 italic">
                            No comments yet. Start the conversation!
                          </p>
                        ) : (
                          comments.map((comment) => (
                            <div
                              key={comment._id}
                              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {comment.author?.avatar ? (
                                    <img
                                      src={comment.author.avatar}
                                      alt={comment.author.name}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                                      {comment.author?.name?.slice(0, 1) || 'U'}
                                    </div>
                                  )}
                                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    {comment.author?.name || 'Team Member'}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>

                                {(user?.role === 'admin' || comment.authorId === user?._id) && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap pl-7">
                                {comment.content}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment box */}
                      <form onSubmit={handleAddComment} className="pt-2">
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Add a comment or update on progress..."
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                          />
                          <button
                            type="submit"
                            disabled={submittingComment || !commentContent.trim()}
                            className="px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* Activity Log Tab */
                    <div className="space-y-3">
                      {activity.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4 italic">
                          No recorded activity yet.
                        </p>
                      ) : (
                        activity.map((act) => (
                          <div
                            key={act._id}
                            className="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300"
                          >
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {act.user?.name || 'Someone'}
                              </span>{' '}
                              <span>{act.action.replace('_', ' ')}</span>
                              {act.details?.from && act.details?.to && (
                                <span className="text-slate-400">
                                  {' '}
                                  from{' '}
                                  <span className="font-mono text-[10px]">
                                    {act.details.from}
                                  </span>{' '}
                                  to{' '}
                                  <span className="font-mono text-[10px]">
                                    {act.details.to}
                                  </span>
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {new Date(act.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
      />
    </>
  );
}
