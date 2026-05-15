import { Link } from 'react-router-dom';
import Badge from '../UI/Badge';
import Avatar from '../UI/Avatar';
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants';
import { formatDate, isOverdue } from '../../utils/helpers';

export default function TaskCard({ task, projectId, onStatusChange }) {
  const status = TASK_STATUS[task.status];
  const priority = TASK_PRIORITY[task.priority];
  const overdue = isOverdue(task.dueDate, task.status);

  const handleStatusClick = (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusChange) onStatusChange(task.id, newStatus);
  };

  const nextStatus = {
    todo: 'in_progress',
    in_progress: 'review',
    review: 'done',
    done: 'todo',
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link
          to={`/tasks/${task.id}`}
          className="font-medium text-gray-900 hover:text-primary-600 transition-colors text-sm line-clamp-2 flex-1"
        >
          {task.title}
        </Link>
        <Badge label={priority.label} colorClass={priority.color} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleStatusClick(e, nextStatus[task.status])}
            className={`badge ${status.color} cursor-pointer hover:opacity-80 transition-opacity`}
            title="Click to advance status"
            aria-label={`Status: ${status.label}. Click to advance.`}
          >
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`} />
            {status.label}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`text-xs ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              {overdue ? '⚠ ' : ''}{formatDate(task.dueDate)}
            </span>
          )}
          {task.assignee && (
            <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
          )}
        </div>
      </div>
    </div>
  );
}
