import { Response } from 'express';
import { z } from 'zod';
import { dbStore } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { sanitizeUser } from '../utils/auth.js';
import { canAccessProject } from '../middleware/rbac.js';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export function getComments(req: AuthenticatedRequest, res: Response) {
  const { taskId } = req.params;
  const task = dbStore.findTaskById(taskId);

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  if (!canAccessProject(req, task.projectId)) {
    res.status(403).json({ error: 'Access denied to this project' });
    return;
  }

  const comments = dbStore.getCommentsByTask(taskId).map((c) => {
    const author = dbStore.findUserById(c.authorId);
    return {
      ...c,
      author: author ? sanitizeUser(author) : null,
    };
  });

  res.status(200).json({ comments });
}

export function createComment(req: AuthenticatedRequest, res: Response) {
  const { taskId } = req.params;
  const user = req.user!;
  const { content } = req.body;

  const task = dbStore.findTaskById(taskId);
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  if (!canAccessProject(req, task.projectId)) {
    res.status(403).json({ error: 'Access denied to this project' });
    return;
  }

  const comment = dbStore.createComment({
    taskId,
    authorId: user._id,
    content,
  });

  // Log activity
  dbStore.logActivity({
    taskId,
    projectId: task.projectId,
    userId: user._id,
    action: 'commented',
    details: { contentSnippet: content.slice(0, 80) },
  });

  // Notify assignee or creator
  const recipientId = task.assigneeId && task.assigneeId !== user._id ? task.assigneeId : (task.creatorId !== user._id ? task.creatorId : null);
  if (recipientId) {
    dbStore.createNotification({
      recipientId,
      senderId: user._id,
      title: 'New Comment',
      message: `${user.name} commented on "${task.title}": "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
      type: 'comment_added',
      link: `/tasks?taskId=${taskId}`,
      read: false,
    });
  }

  res.status(201).json({
    message: 'Comment added',
    comment: {
      ...comment,
      author: sanitizeUser(user),
    },
  });
}

export function deleteComment(req: AuthenticatedRequest, res: Response) {
  const { commentId } = req.params;
  const user = req.user!;

  const allComments = dbStore['state'].comments;
  const comment = allComments.find((c) => c._id === commentId);

  if (!comment) {
    res.status(404).json({ error: 'Comment not found' });
    return;
  }

  if (user.role !== 'admin' && comment.authorId !== user._id) {
    res.status(403).json({ error: 'You can only delete your own comments.' });
    return;
  }

  dbStore.deleteComment(commentId);
  res.status(200).json({ message: 'Comment deleted successfully' });
}
