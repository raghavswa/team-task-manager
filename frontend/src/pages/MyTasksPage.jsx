import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api/tasks.api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Avatar from '../components/UI/Avatar';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';
import { formatDate, isOverdue } from '../utils/helpers';

const FILTERS = ['all', 'todo', 'in_progress', 'review', 'done'];

const PRIORITY_COLORS = {
  low: 'text-slate-500 bg-slate-100',
  medium: 'text-blue-600 bg-blue-50',
  high: 'text-orange-600 bg-orange-50',
  urgent: 'text-red-600 bg-red-50',
};

export default function MyTasksPage() {
  const [filter, setFilter] = useState('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['myTasks'],
    queryFn: () => tasksApi.getMyTasks().then((r) => r.data.data.tasks),
  });

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">My Tasks</h2>
          <p className="page-subtitle">
            {tasks.length} total
            {overdueTasks.length > 0 && (
              <span className="ml-2 text-red-500 font-semibold">· {overdueTasks.length} overdue</span>
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6 p-1 bg-slate-100 rounded-xl w-fit">
        {FILTERS.map((f) => {
          const count = f === 'all' ? tasks.length : tasks.filter((t) => t.status === f).length;
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'all' ? 'All' : TASK_STATUS[f]?.label}
              <span className={`ml-1.5 text-[10px] font-bold ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={filter === 'done' ? '🎉' : '✅'}
          title={filter === 'all' ? 'No tasks assigned to you' : `No ${TASK_STATUS[filter]?.label} tasks`}
          description="Tasks assigned to you across all projects will appear here."
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const status = TASK_STATUS[task.status];
            const priority = TASK_PRIORITY[task.priority];
            const overdue = isOverdue(task.dueDate, task.status);
            const pColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;

            return (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="card flex items-center gap-4 p-4 hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
              >
                {/* Status dot */}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot}`} />

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-violet-600 transition-colors">
                    {task.title}
                  </p>
                  {task.project && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: task.project.color }} />
                      <span className="text-xs text-slate-400 truncate">{task.project.name}</span>
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${pColor}`}>
                    {priority.label}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${status.color}`}>
                    {status.label}
                  </span>
                  {task.dueDate && (
                    <span className={`text-xs font-medium hidden sm:block ${overdue ? 'text-red-500' : 'text-slate-400'}`}>
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
  );
}
