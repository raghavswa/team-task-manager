import TaskCard from './TaskCard';
import { TASK_STATUS } from '../../utils/constants';

const COLUMNS = ['todo', 'in_progress', 'review', 'done'];

export default function KanbanBoard({ tasks = [], projectId, onStatusChange }) {
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {COLUMNS.map((col) => {
        const { label, color, dot } = TASK_STATUS[col];
        const colTasks = grouped[col];

        return (
          <div key={col} className="flex flex-col min-h-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-sm font-semibold text-gray-700">{label}</span>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {colTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div className="flex-1 space-y-3 overflow-y-auto pb-2">
              {colTasks.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-xs text-gray-400">No tasks</p>
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
