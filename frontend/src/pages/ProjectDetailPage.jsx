import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects.api';
import { tasksApi } from '../api/tasks.api';
import { useAuth } from '../context/AuthContext';
import KanbanBoard from '../components/Tasks/KanbanBoard';
import TaskForm from '../components/Tasks/TaskForm';
import ProjectForm from '../components/Projects/ProjectForm';
import Modal from '../components/UI/Modal';
import Avatar from '../components/UI/Avatar';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { MEMBER_ROLE, PROJECT_STATUS } from '../utils/constants';
import { formatDate, getApiError } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [activeTab, setActiveTab] = useState('board');

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id).then((r) => r.data.data.project),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getProjectTasks(id).then((r) => r.data.data.tasks),
    enabled: !!id,
  });

  const isAdmin = project?.userRole === 'admin';

  const createTaskMutation = useMutation({
    mutationFn: (payload) => tasksApi.create(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setShowAddTask(false);
      toast.success('Task created.');
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => tasksApi.updateStatus(id, taskId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', id] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (payload) => projectsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      setShowEditProject(false);
      toast.success('Project updated.');
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
      toast.success('Project deleted.');
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const addMemberMutation = useMutation({
    mutationFn: () => projectsApi.addMember(id, { email: memberEmail, role: memberRole }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      setShowAddMember(false);
      setMemberEmail('');
      toast.success('Member added.');
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => projectsApi.removeMember(id, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', id] });
      toast.success('Member removed.');
    },
    onError: (err) => toast.error(getApiError(err)),
  });

  if (projLoading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (!project) return <p className="text-center text-gray-500 mt-20">Project not found.</p>;

  const statusInfo = PROJECT_STATUS[project.status];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            {project.description && (
              <p className="text-sm text-gray-500 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge label={statusInfo.label} colorClass={statusInfo.color} />
          {project.dueDate && (
            <span className="text-xs text-gray-500">Due {formatDate(project.dueDate)}</span>
          )}
          {isAdmin && (
            <>
              <button className="btn-secondary text-xs" onClick={() => setShowEditProject(true)}>
                Edit
              </button>
              <button
                className="btn-danger text-xs"
                onClick={() => {
                  if (window.confirm('Delete this project and all its tasks?')) {
                    deleteProjectMutation.mutate();
                  }
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {['board', 'members'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'board' ? 'Task Board' : 'Members'}
            {tab === 'board' && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                {tasks.length}
              </span>
            )}
            {tab === 'members' && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                {project.projectMembers?.length || 0}
              </span>
            )}
          </button>
        ))}

        {activeTab === 'board' && (
          <button className="btn-primary text-xs ml-auto" onClick={() => setShowAddTask(true)}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        )}
        {activeTab === 'members' && isAdmin && (
          <button className="btn-primary text-xs ml-auto" onClick={() => setShowAddMember(true)}>
            Add Member
          </button>
        )}
      </div>

      {/* Board tab */}
      {activeTab === 'board' && (
        tasksLoading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner /></div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            projectId={id}
            onStatusChange={(taskId, status) => updateStatusMutation.mutate({ taskId, status })}
          />
        )
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <div className="card divide-y divide-gray-100">
          {project.projectMembers?.map((m) => {
            const roleInfo = MEMBER_ROLE[m.role];
            return (
              <div key={m.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={m.user?.name} src={m.user?.avatar} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.user?.name}</p>
                    <p className="text-xs text-gray-500">{m.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={roleInfo.label} colorClass={roleInfo.color} />
                  {isAdmin && m.userId !== user.id && (
                    <button
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => removeMemberMutation.mutate(m.userId)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="New Task">
        <TaskForm
          onSubmit={(payload) => createTaskMutation.mutate(payload)}
          members={project.projectMembers || []}
          loading={createTaskMutation.isPending}
        />
      </Modal>

      <Modal isOpen={showEditProject} onClose={() => setShowEditProject(false)} title="Edit Project">
        <ProjectForm
          initialData={project}
          onSubmit={(payload) => updateProjectMutation.mutate(payload)}
          loading={updateProjectMutation.isPending}
        />
      </Modal>

      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="member-email">Email Address</label>
            <input
              id="member-email"
              type="email"
              className="input"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="colleague@example.com"
            />
          </div>
          <div>
            <label className="label" htmlFor="member-role">Role</label>
            <select
              id="member-role"
              className="input"
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button className="btn-secondary" onClick={() => setShowAddMember(false)}>Cancel</button>
            <button
              className="btn-primary"
              onClick={() => addMemberMutation.mutate()}
              disabled={!memberEmail || addMemberMutation.isPending}
            >
              {addMemberMutation.isPending ? <LoadingSpinner size="sm" /> : null}
              Add Member
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
