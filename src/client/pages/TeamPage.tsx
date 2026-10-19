import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Mail, Briefcase, Building, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../api/client.js';
import { User } from '../types/index.js';
import { Badge } from '../components/common/Badge.js';
import { Skeleton } from '../components/common/Skeleton.js';
import { useToast } from '../context/ToastContext.js';

export function TeamPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchTeam = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(res.users);
    } catch (err) {
      console.error('Failed to load team members:', err);
      showToast('Failed to load team directory', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, showToast]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Team Directory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Workspace members and active sprint workload allocation
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or title..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="project_manager">Project Manager</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
            >
              <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
              <Skeleton className="h-5 w-24 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {users.map((member) => (
            <div
              key={member._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between text-center hover:border-slate-300 dark:hover:border-slate-700 transition-all"
            >
              <div>
                {/* Avatar */}
                <div className="relative w-16 h-16 mx-auto mb-3">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/25">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {member.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {member.title || 'Team Member'}
                </p>

                <div className="mt-2.5">
                  <Badge variant="role" role={member.role} className="text-[10px]">
                    {member.role.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-left">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{member.department || 'General'}</span>
                  </div>
                </div>
              </div>

              {/* Workload Stats */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-400 font-bold block">Assigned</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {member.stats?.totalTasks ?? 0}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                  <span className="text-[10px] font-bold block">Completed</span>
                  <span className="font-extrabold">
                    {member.stats?.completedTasks ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
