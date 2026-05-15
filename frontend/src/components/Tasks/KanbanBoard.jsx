import TaskCard from './TaskCard';
import { TASK_STATUS } from '../../utils/constants';

const COLUMNS = ['todo', 'in_progress', 'review', 'done'];

const COLUMN_STYLES = {
  todo:        { header: 'bg-slate-100 text-slate-600',  count: 'bg-slate-200 text-slate-600' },
  in_progress: { header: 'bg-blue-50 text-blue-700',     count: 'bg-blue-100 text-blue-700' },
  review:      { header: 'bg-amber-50 text-amber-700',   count: 'bg-amber-100 text-amber-700' },
  done:        { header: 'bg-emerald-50 text-emerald-700', count: 'bg-emerald-100 text-emerald-700' },
};

export default function KanbanBoard({ tasks = [], projectId, onStatusChange }) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const { label, dot } = TASK_STATUS[col];
        const colTasks = grouped[col];
        const styles = COLUMN_STYLES[col];

        return (
          <div key={col} className="flex flex-col min-h-[400px]">
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${styles.header}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dot}`} />
                <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${styles.count}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Task list */}
            <div className="flex-1 space-y-2.5">
              {colTasks.length === 0 ? (
                <div className="border-2 border-dashed border-slate-100 rounded-xl p-8 text-center">
                  <p className="text-xs text-slate-300 font-medium">Drop tasks here</p>
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projectId={projectId}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
