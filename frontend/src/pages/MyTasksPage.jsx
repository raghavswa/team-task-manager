import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api/tasks.api';
import Badge from '../components/UI/Badge';
import Avatar from '../components/UI/Avatar';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';
import { formatDate, isOverdue } from '../utils/helpers';

const FILTERS = ['all', 'todo', 'in_progress', 'review', 'done'];

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {tasks.length} total · {overdueTasks.length} overdue
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map((f) => {
          const count = f === 'all' ? tasks.length : tasks.filter((t) => t.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All' : TASK_STATUS[f]?.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="✅"
          title={filter === 'all' ? 'No tasks assigned to you' : `No ${TASK_STATUS[filter]?.label} tasks`}
          description="Tasks assigned to you will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => {
            const status = TASK_STATUS[task.status];
            const priority = TASK_PRIORITY[task.priority];
            const overdue = isOverdue(task.dueDate, task.status);

            return (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow block"
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot}`} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  {task.project && (
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: task.project.color }}
                      />
                      {task.project.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge label={priority.label} colorClass={priority.color} />
                  <Badge label={status.label} colorClass={status.color} dot={status.dot} />
                  {task.dueDate && (
                    <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                      {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
