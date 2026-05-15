import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import { projectsApi } from '../api/projects.api';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/Tasks/TaskForm';
import Modal from '../components/UI/Modal';
import Badge from '../components/UI/Badge';
import Avatar from '../components/UI/Avatar';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { TASK_STATUS, TASK_PRIORITY } from '../utils/constants';
import { formatDate, formatRelative, isOverdue, getApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getById(id).then((r) => r.data.data.task),
  });

  const { data: project } = useQuery({
    queryKey: ['project', task?.projectId],
    queryFn: () => projectsApi.getById(task.projectId).then((r) => r.data.data.project),
    enabled: !!task?.projectId,
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => tasksApi.update(task.projectId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', id] });
      qc.invalidateQueries({ queryKey: ['tasks', task?.projectId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setShowEdit(false);
      toast.success('Task updated.');
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task.projectId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', task?.projectId] });
      navigate(`/projects/${task.projectId}`);
      toast.success('Task deleted.');
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => tasksApi.updateStatus(task.projectId, id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task', id] });
      qc.invalidateQueries({ queryKey: ['tasks', task?.projectId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (!task) return <p className="text-center text-gray-500 mt-20">Task not found.</p>;

  const status = TASK_STATUS[task.status];
  const priority = TASK_PRIORITY[task.priority];
  const overdue = isOverdue(task.dueDate, task.status);
  const canEdit = project?.userRole === 'admin' || task.creatorId === user?.id || task.assigneeId === user?.id;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/projects" className="hover:text-gray-700">Projects</Link>
        <span>/</span>
        {task.project && (
          <>
            <Link to={`/projects/${task.project.id}`} className="hover:text-gray-700">
              {task.project.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium truncate">{task.title}</span>
      </nav>

      {/* Task card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex-1">{task.title}</h2>
          {canEdit && (
            <div className="flex gap-2 flex-shrink-0">
              <button className="btn-secondary text-xs" onClick={() => setShowEdit(true)}>Edit</button>
              <button
                className="btn-danger text-xs"
                onClick={() => {
                  if (window.confirm('Delete this task?')) deleteMutation.mutate();
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {task.description && (
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{task.description}</p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Status</p>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(TASK_STATUS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => statusMutation.mutate(key)}
                  className={`badge cursor-pointer transition-all ${
                    task.status === key
                      ? `${val.color} ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Priority</p>
            <Badge label={priority.label} colorClass={priority.color} />
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Assignee</p>
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar name={task.assignee.name} size="sm" />
                <span className="text-sm text-gray-700">{task.assignee.name}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Unassigned</span>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Due Date</p>
            {task.dueDate ? (
              <span className={`text-sm font-medium ${overdue ? 'text-red-500' : 'text-gray-700'}`}>
                {overdue ? '⚠ Overdue · ' : ''}{formatDate(task.dueDate)}
              </span>
            ) : (
              <span className="text-sm text-gray-400">No due date</span>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Created by</p>
            {task.creator && (
              <div className="flex items-center gap-2">
                <Avatar name={task.creator.name} size="sm" />
                <span className="text-sm text-gray-700">{task.creator.name}</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Created</p>
            <span className="text-sm text-gray-600">{formatRelative(task.createdAt)}</span>
          </div>
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Task">
        <TaskForm
          initialData={task}
          members={project?.projectMembers || []}
          onSubmit={(payload) => updateMutation.mutate(payload)}
          loading={updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}
