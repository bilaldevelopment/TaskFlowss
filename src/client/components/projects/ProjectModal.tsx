import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { Project, ProjectStatus } from '../../types/index.js';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  onSuccess: () => void;
}

export function ProjectModal({
  isOpen,
  onClose,
  projectToEdit,
  onSuccess,
}: ProjectModalProps) {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [color, setColor] = useState('#4F46E5');
  const [targetDate, setTargetDate] = useState('');

  const PRESET_COLORS = [
    '#4F46E5', // Indigo
    '#0EA5E9', // Sky Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#14B8A6', // Teal
  ];

  useEffect(() => {
    if (isOpen) {
      if (projectToEdit) {
        setName(projectToEdit.name);
        setKey(projectToEdit.key);
        setDescription(projectToEdit.description || '');
        setStatus(projectToEdit.status);
        setColor(projectToEdit.color || '#4F46E5');
        setTargetDate(projectToEdit.targetDate ? projectToEdit.targetDate.slice(0, 10) : '');
      } else {
        setName('');
        setKey('');
        setDescription('');
        setStatus('active');
        setColor('#4F46E5');
        setTargetDate('');
      }
    }
  }, [isOpen, projectToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Project name is required', 'error');
      return;
    }
    if (!key.trim()) {
      showToast('Project key is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload: Partial<Project> = {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
        status,
        color,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      };

      if (projectToEdit) {
        await api.updateProject(projectToEdit._id, payload);
        showToast('Project updated successfully', 'success');
      } else {
        await api.createProject(payload);
        showToast('Project created successfully', 'success');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Project' : 'Create New Project'}
      description="Organize your team's tasks and sprints inside a unified project."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!projectToEdit && !key) {
                // Auto generate key candidate from name
                const words = e.target.value.trim().split(/\s+/);
                const suggested = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
                if (/^[A-Z0-9]+$/.test(suggested)) setKey(suggested);
              }
            }}
            placeholder="e.g. Mobile App Redesign"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Key & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Project Key (2-6 letters) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!!projectToEdit}
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="e.g. MOB"
              maxLength={6}
              className="w-full px-3.5 py-2 text-sm font-mono uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Color Palette Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Project Theme Color
          </label>
          <div className="flex items-center gap-2.5">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === preset ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
        </div>

        {/* Target Milestone Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Target Completion Date
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief purpose, goals, or sprint milestones..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
