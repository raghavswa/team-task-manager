import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { dashboardApi } from '../api/dashboard.api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Badge from '../components/UI/Badge';
import Avatar from '../components/UI/Avatar';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';
import { formatDate, isOverdue, getProgressPercent } from '../utils/helpers';

const STATUS_COLORS = { todo: '#9ca3af', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981' };
const PRIORITY_COLORS = { low: '#9ca3af', medium: '#3b82f6', high: '#f97316', urgent: '#ef4444' };

function StatCard({ label, value, sub, color = 'text-gray-900' }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

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

  const statusChartData = Object.entries(tasksByStatus || {}).map(([key, val]) => ({
    name: TASK_STATUS[key]?.label,
    value: val,
    color: STATUS_COLORS[key],
  })).filter((d) => d.value > 0);

  const priorityChartData = Object.entries(tasksByPriority || {}).map(([key, val]) => ({
    name: TASK_PRIORITY[key]?.label,
    value: val,
    fill: PRIORITY_COLORS[key],
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening across your projects.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={summary?.totalProjects ?? 0} />
        <StatCard label="Total Tasks" value={summary?.totalTasks ?? 0} />
        <StatCard
          label="Overdue Tasks"
          value={summary?.overdueTasks ?? 0}
          color={summary?.overdueTasks > 0 ? 'text-red-600' : 'text-gray-900'}
        />
        <StatCard
          label="Completion Rate"
          value={`${summary?.completionRate ?? 0}%`}
          sub={`${summary?.completedTasks ?? 0} tasks done`}
          color="text-green-600"
        />
      </div>

      {/* Charts */}
      {summary?.totalTasks > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status pie */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Tasks by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {statusChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority bar */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityChartData} barSize={36}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" name="Tasks" radius={[4, 4, 0, 0]}>
                  {priorityChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tasks */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Tasks</h3>
          {recentTasks?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {recentTasks?.map((task) => {
                const st = TASK_STATUS[task.status];
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st?.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400">{task.project?.name}</p>
                    </div>
                    {task.dueDate && (
                      <span className={`text-xs flex-shrink-0 ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.assignee && <Avatar name={task.assignee.name} size="sm" />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Projects overview */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Projects</h3>
            <Link to="/projects" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {projects?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No projects yet.</p>
          ) : (
            <div className="space-y-3">
              {projects?.slice(0, 5).map((p) => {
                const progress = getProgressPercent(p.taskStats);
                return (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{p.taskStats?.total || 0} tasks</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
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
