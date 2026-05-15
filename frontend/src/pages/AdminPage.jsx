import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/UI/Avatar';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import { formatDate, formatRelative, getApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

const TABS = ['overview', 'users', 'projects'];

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, bg, iconColor, valueColor = 'text-slate-900' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${bg} ${iconColor} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Role badge ─────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  return role === 'superadmin'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">⚡ Super Admin</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">User</span>;
}

// ── Status badge ───────────────────────────────────────────────────────────
function ActiveBadge({ isActive }) {
  return isActive
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Inactive</span>;
}

export default function AdminPage() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // user object

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', search],
    queryFn: () => adminApi.getUsers({ search, limit: 50 }).then((r) => r.data.data),
    enabled: tab === 'users' || tab === 'overview',
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['adminProjects'],
    queryFn: () => adminApi.getProjects({ limit: 50 }).then((r) => r.data.data),
    enabled: tab === 'projects',
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const roleMutation = useMutation({
    mutationFn: ({ userId, systemRole }) => adminApi.updateUserRole(userId, systemRole),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); qc.invalidateQueries({ queryKey: ['adminStats'] }); toast.success('Role updated.'); },
    onError: (e) => toast.error(getApiError(e)),
  });

  const toggleMutation = useMutation({
    mutationFn: (userId) => adminApi.toggleUserActive(userId),
    onSuccess: (_, userId) => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); qc.invalidateQueries({ queryKey: ['adminStats'] }); toast.success('Status updated.'); },
    onError: (e) => toast.error(getApiError(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adminUsers'] }); qc.invalidateQueries({ queryKey: ['adminStats'] }); setConfirmDelete(null); toast.success('User deleted.'); },
    onError: (e) => toast.error(getApiError(e)),
  });

  const users = usersData?.users || [];
  const projects = projectsData?.projects || [];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wide">Super Admin</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Panel</h2>
          <p className="text-slate-500 text-sm mt-0.5">System-wide management and oversight</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-150 ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        statsLoading ? <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div> : (
          <div className="space-y-6 animate-fade-in">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats?.users?.total ?? 0}
                sub={`${stats?.users?.active ?? 0} active`}
                bg="bg-violet-50" iconColor="text-violet-600" valueColor="text-violet-700"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
              />
              <StatCard label="Super Admins" value={stats?.users?.superAdmins ?? 0}
                bg="bg-amber-50" iconColor="text-amber-600" valueColor="text-amber-700"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              />
              <StatCard label="Total Projects" value={stats?.projects?.total ?? 0}
                sub={`${stats?.projects?.active ?? 0} active`}
                bg="bg-blue-50" iconColor="text-blue-600" valueColor="text-blue-700"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>}
              />
              <StatCard label="Total Tasks" value={stats?.tasks?.total ?? 0}
                sub={`${stats?.tasks?.byStatus?.done ?? 0} completed`}
                bg="bg-emerald-50" iconColor="text-emerald-600" valueColor="text-emerald-700"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>

            {/* Task status breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card p-6">
                <h3 className="font-bold text-slate-800 mb-4">Task Status Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { key: 'todo',        label: 'To Do',       color: 'bg-slate-300', text: 'text-slate-600' },
                    { key: 'in_progress', label: 'In Progress', color: 'bg-blue-400',  text: 'text-blue-600' },
                    { key: 'review',      label: 'Review',      color: 'bg-amber-400', text: 'text-amber-600' },
                    { key: 'done',        label: 'Done',        color: 'bg-emerald-500', text: 'text-emerald-600' },
                  ].map(({ key, label, color, text }) => {
                    const count = stats?.tasks?.byStatus?.[key] ?? 0;
                    const total = stats?.tasks?.total || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={`font-semibold ${text}`}>{label}</span>
                          <span className="text-slate-500">{count} <span className="text-slate-300">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent users */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Recent Signups</h3>
                  <button onClick={() => setTab('users')} className="text-xs text-violet-600 font-semibold hover:text-violet-700">View all →</button>
                </div>
                <div className="space-y-3">
                  {(stats?.recentUsers || []).map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <Avatar name={u.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <RoleBadge role={u.systemRole} />
                        <ActiveBadge isActive={u.isActive} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          {/* Search */}
          <div className="relative max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input className="input pl-9 py-2" placeholder="Search users…"
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => {
                    const isMe = u.id === me?.id;
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/60 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={u.name} size="sm" />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">
                                {u.name}
                                {isMe && <span className="ml-1.5 text-[10px] text-violet-500 font-bold">(you)</span>}
                              </p>
                              <p className="text-xs text-slate-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-xs text-slate-500">{formatRelative(u.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <RoleBadge role={u.systemRole} />
                        </td>
                        <td className="px-4 py-3.5">
                          <ActiveBadge isActive={u.isActive} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {!isMe && (
                              <>
                                {/* Toggle role */}
                                <button
                                  onClick={() => roleMutation.mutate({ userId: u.id, systemRole: u.systemRole === 'superadmin' ? 'user' : 'superadmin' })}
                                  disabled={roleMutation.isPending}
                                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
                                  title={u.systemRole === 'superadmin' ? 'Demote to User' : 'Promote to Super Admin'}
                                >
                                  {u.systemRole === 'superadmin' ? 'Demote' : 'Promote'}
                                </button>

                                {/* Toggle active */}
                                <button
                                  onClick={() => toggleMutation.mutate(u.id)}
                                  disabled={toggleMutation.isPending}
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-40 ${
                                    u.isActive
                                      ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                >
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => setConfirmDelete(u)}
                                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-sm">No users found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── PROJECTS TAB ── */}
      {tab === 'projects' && (
        <div className="space-y-4 animate-fade-in">
          {projectsLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Project</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Owner</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Members</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projects.map((p) => {
                    const statusColors = { active: 'bg-emerald-100 text-emerald-700', archived: 'bg-slate-100 text-slate-600', completed: 'bg-blue-100 text-blue-700' };
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ backgroundColor: p.color || '#7c3aed' }}>
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                              {p.description && <p className="text-xs text-slate-400 truncate max-w-xs">{p.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar name={p.owner?.name} size="sm" />
                            <span className="text-xs text-slate-600 truncate">{p.owner?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${statusColors[p.status] || statusColors.active}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-semibold text-slate-600">
                            {p.projectMembers?.length || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-xs text-slate-400">{formatDate(p.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {projects.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-sm">No projects found.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete User" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-red-800">This action is irreversible</p>
              <p className="text-xs text-red-600 mt-0.5">
                Deleting <strong>{confirmDelete?.name}</strong> will remove their account and all associated data.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary btn-sm" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button
              className="btn-danger btn-sm"
              onClick={() => deleteMutation.mutate(confirmDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <LoadingSpinner size="sm" /> : null}
              Delete permanently
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
