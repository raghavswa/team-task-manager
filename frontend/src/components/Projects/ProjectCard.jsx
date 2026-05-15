import { Link } from 'react-router-dom';
import { PROJECT_STATUS } from '../../utils/constants';
import { formatDate, getProgressPercent } from '../../utils/helpers';

export default function ProjectCard({ project }) {
  const status = PROJECT_STATUS[project.status] || PROJECT_STATUS.active;
  const stats = project.taskStats || {};
  const progress = getProgressPercent(stats);
  const isAdmin = project.userRole === 'admin';

  return (
    <Link to={`/projects/${project.id}`} className="card-hover p-5 block group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{ backgroundColor: project.color || '#7c3aed' }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors text-sm leading-tight truncate">
              {project.name}
            </h3>
            <span className={`inline-flex items-center mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
        {isAdmin && (
          <span className="flex-shrink-0 text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-lg">
            Admin
          </span>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
      )}

      {/* Task stats row */}
      <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
        {[
          { label: 'Todo', val: stats.todo || 0, color: 'bg-slate-300' },
          { label: 'In Progress', val: stats.in_progress || 0, color: 'bg-blue-400' },
          { label: 'Done', val: stats.done || 0, color: 'bg-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
            <span>{s.val}</span>
          </div>
        ))}
        <span className="ml-auto font-semibold text-slate-700">{stats.total || 0} total</span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: project.color || '#7c3aed' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium">{progress}% complete</span>
        {project.dueDate && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(project.dueDate)}
          </span>
        )}
      </div>
    </Link>
  );
}
