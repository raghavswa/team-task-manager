import api from './axios';

export const tasksApi = {
  getProjectTasks: (projectId, params) =>
    api.get(`/projects/${projectId}/tasks`, { params }),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (projectId, id, data) => api.put(`/projects/${projectId}/tasks/${id}`, data),
  updateStatus: (projectId, id, status) =>
    api.patch(`/projects/${projectId}/tasks/${id}/status`, { status }),
  delete: (projectId, id) => api.delete(`/projects/${projectId}/tasks/${id}`),
  getMyTasks: () => api.get('/tasks/my'),
};
