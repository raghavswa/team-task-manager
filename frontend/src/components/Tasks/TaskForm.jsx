import { useState } from 'react';
import LoadingSpinner from '../UI/LoadingSpinner';

export default function TaskForm({ onSubmit, initialData = {}, members = [], loading }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    status: initialData.status || 'todo',
    priority: initialData.priority || 'medium',
    assigneeId: initialData.assigneeId || initialData.assignee?.id || '',
    dueDate: initialData.dueDate || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required.';
    if (form.title.length > 200) errs.title = 'Title must be under 200 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...form };
    if (!payload.assigneeId) delete payload.assigneeId;
    if (!payload.dueDate) delete payload.dueDate;
    onSubmit(payload);
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="task-title">Title *</label>
        <input
          id="task-title"
          className={`input ${errors.title ? 'input-error' : ''}`}
          value={form.title}
          onChange={set('title')}
          placeholder="What needs to be done?"
          maxLength={200}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="label" htmlFor="task-desc">Description</label>
        <textarea
          id="task-desc"
          className="input resize-none"
          rows={3}
          value={form.description}
          onChange={set('description')}
          placeholder="Add more details..."
          maxLength={2000}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="task-status">Status</label>
          <select id="task-status" className="input" value={form.status} onChange={set('status')}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="task-priority">Priority</label>
          <select id="task-priority" className="input" value={form.priority} onChange={set('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="task-assignee">Assignee</label>
          <select id="task-assignee" className="input" value={form.assigneeId} onChange={set('assigneeId')}>
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user?.id || m.id} value={m.user?.id || m.id}>
                {m.user?.name || m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="task-due">Due Date</label>
          <input
            id="task-due"
            type="date"
            className="input"
            value={form.dueDate}
            onChange={set('dueDate')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : null}
          {initialData.id ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
