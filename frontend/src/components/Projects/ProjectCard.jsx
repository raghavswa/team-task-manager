import { Link } from 'react-router-dom';
import Badge from '../UI/Badge';
import Avatar from '../UI/Avatar';
import { PROJECT_STATUS } from '../../utils/constants';
import { formatDate, getProgressPercent } from '../../utils/helpers';

export default function ProjectCard({ project }) {
  const status = PROJECT_STATUS[project.status] || PROJECT_STATUS.active;
  const stats = project.taskStats || {};
  const progress = getProgressPercent(stats);

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card p-5 hover:shadow-md transition-shadow block group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: project.color || '#6366f1' }}
          />
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {project.name}
          </h3>
        </div>
        <Badge label={status.label} colorClass={status.color} />
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>{stats.total || 0} tasks</span>
          <span>{progress}% done</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="font-medium capitalize">{project.userRole}</span>
        </div>
        {project.dueDate && (
          <span>Due {formatDate(project.dueDate)}</span>
        )}
      </div>
    </Link>
  );
}
