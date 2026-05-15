import { Link } from 'react-router-dom';
import Avatar from '../UI/Avatar';
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants';
import { formatDate, isOverdue } from '../../utils/helpers';

const PRIORITY_STYLES = {
  low:    { bar: 'bg-slate-300',   dot: 'bg-slate-400',   text: 'text-slate-500' },
  medium: { bar: 'bg-blue-400',    dot: 'bg-blue-500',    text: 'text-blue-600' },
  high:   { bar: 'bg-orange-400',  dot: 'bg-orange-500',  text: 'text-orange-600' },
  urgent: { bar: 'bg-red-500',     dot: 'bg-red-500',     text: 'text-red-600' },
};

const nextStatus = { todo: 'in_progress', in_progress: 'review', review: 'done', done: 'todo' };

export default function TaskCard({ task, onStatusChange }) {
  const status = TASK_STATUS[task.status];
  const priority = TASK_PRIORITY[task.priority];
  const pStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
  const overdue = isOverdue(task.dueDate, task.status);

  const handleAdvance = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusChange) onStatusChange(task.id, nextStatus[task.status]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 group">
      {/* Priority accent bar */}
      <div className={`h-0.5 rounded-t-xl ${pStyle.bar}`} />

      <div className="p-3.5">
        {/* Title */}
        <Link
          to={`/tasks/${task.id}`}
          className="block text-sm font-semibold text-slate-800 hover:text-violet-600 transition-colors line-clamp-2 leading-snug mb-2.5"
        >
          {task.title}
        </Link>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          {/* Status pill — click to advance */}
          <button
            onClick={handleAdvance}
            title="Click to advance status"
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80 active:scale-95 ${status.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </button>

          <div className="flex items-center gap-2">
            {/* Priority indicator */}
            <span className={`text-[10px] font-bold uppercase tracking-wide ${pStyle.text}`}>
              {priority.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`text-[11px] font-medium flex items-center gap-0.5 ${overdue ? 'text-red-500' : 'text-slate-400'}`}>
                {overdue && <span>⚠</span>}
                {formatDate(task.dueDate)}
              </span>
            )}

            {/* Assignee */}
            {task.assignee && (
              <Avatar name={task.assignee.name} src={task.assignee.avatar} size="sm" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
