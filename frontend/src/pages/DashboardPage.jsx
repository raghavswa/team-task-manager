import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '../api/dashboard.api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Avatar from '../components/UI/Avatar';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';
import { formatDate, isOverdue, getProgressPercent } from '../utils/helpers';

const STATUS_COLORS = { todo: '#94a3b8', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981' };
const PRIORITY_COLORS = { low: '#94a3b8', medium: '#3b82f6', high: '#f97316', urgent: '#ef4444' };

const STAT_CARDS = [
  {
    key: 'totalProjects',
    label: 'Total Projects',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
    bg: 'bg-violet-50', iconColor: 'text-violet-600', valueColor: 'text-violet-700',
  },
  {
    key: 'totalTasks',
    label: 'Total Tasks',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    bg: 'bg-blue-50', iconColor: 'text-blue-600', valueColor: 'text-blue-700',
  },
  {
    key: 'overdueTasks',
    label: 'Overdue',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: 'bg-red-50', iconColor: 'text-red-500', valueColor: 'text-red-600',
    alert: true,
  },
  {
    key: 'completionRate',
    label: 'Completion Rate',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: 'bg-emerald-50', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700',
    suffix: '%',
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <p className="font-semibold">{label || payload[0].name}</p>
      <p className="text-slate-300">{payload[0].value} tasks</p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { summary, tasksByStatus, tasksByPriority, recentTasks, projects } = data || {};

  const statusChartData = Object.entries(tasksByStatus || {})
    .map(([key, val]) => ({ name: TASK_STATUS[key]?.label, value: val, color: STATUS_COLORS[key] }))
    .filter((d) => d.value > 0);

  const priorityChartData = Object.entries(tasksByPriority || {}).map(([key, val]) => ({
    name: TASK_PRIORITY[key]?.label, value: val, fill: PRIORITY_COLORS[key],
  }));

  return (
    <div className="space-y-7 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening across your projects.</p>
        </div>
        <Link to="/projects" className="btn-primary btn-sm hidden sm:inline-flex">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon, bg, iconColor, valueColor, suffix, alert }) => {
          const raw = summary?.[key] ?? 0;
          const value = suffix ? `${raw}${suffix}` : raw;
          const isAlert = alert && raw > 0;
          return (
            <div key={key} className={`card p-5 ${isAlert ? 'border-red-100 bg-red-50/30' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 ${bg} ${iconColor} rounded-xl flex items-center justify-center`}>
                  {icon}
                </div>
                {isAlert && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-md">!</span>
                )}
              </div>
              <p className={`text-2xl font-bold ${isAlert ? 'text-red-600' : valueColor}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
              {key === 'completionRate' && (
                <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${raw}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      {(summary?.totalTasks ?? 0) > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800">Tasks by Status</h3>
              <span className="text-xs text-slate-400">{summary?.totalTasks} total</span>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2.5">
                {statusChartData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-slate-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800">Tasks by Priority</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={priorityChartData} barSize={28} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 6 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">Recent Tasks</h3>
            <Link to="/tasks/my" className="text-xs text-violet-600 font-semibold hover:text-violet-700">View mine →</Link>
          </div>
          {!recentTasks?.length ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm text-slate-400">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTasks.map((task) => {
                const st = TASK_STATUS[task.status];
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <Link key={task.id} to={`/tasks/${task.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st?.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate group-hover:text-violet-600 transition-colors">{task.title}</p>
                      <p className="text-xs text-slate-400 truncate">{task.project?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.dueDate && (
                        <span className={`text-xs ${overdue ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                          {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-800">Projects</h3>
            <Link to="/projects" className="text-xs text-violet-600 font-semibold hover:text-violet-700">View all →</Link>
          </div>
          {!projects?.length ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm text-slate-400">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((p) => {
                const progress = getProgressPercent(p.taskStats);
                return (
                  <Link key={p.id} to={`/projects/${p.id}`}
                    className="block p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-3 h-3 rounded-md flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-600 transition-colors">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-slate-400">{p.taskStats?.total || 0} tasks</span>
                        <span className="text-xs font-bold text-slate-600">{progress}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: p.color }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
