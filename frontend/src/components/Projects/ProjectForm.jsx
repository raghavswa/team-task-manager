import { useState } from 'react';
import LoadingSpinner from '../UI/LoadingSpinner';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ProjectForm({ onSubmit, initialData = {}, loading }) {
  const [form, setForm] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    dueDate: initialData.dueDate || '',
    color: initialData.color || '#6366f1',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Project name is required.';
    if (form.name.length > 150) errs.name = 'Name must be under 150 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit(form);
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="proj-name">Project Name *</label>
        <input
          id="proj-name"
          className={`input ${errors.name ? 'input-error' : ''}`}
          value={form.name}
          onChange={set('name')}
          placeholder="e.g. Website Redesign"
          maxLength={150}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="label" htmlFor="proj-desc">Description</label>
        <textarea
          id="proj-desc"
          className="input resize-none"
          rows={3}
          value={form.description}
          onChange={set('description')}
          placeholder="What is this project about?"
          maxLength={1000}
        />
      </div>

      <div>
        <label className="label" htmlFor="proj-due">Due Date</label>
        <input
          id="proj-due"
          type="date"
          className="input"
          value={form.dueDate}
          onChange={set('dueDate')}
        />
      </div>

      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : null}
          {initialData.id ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
