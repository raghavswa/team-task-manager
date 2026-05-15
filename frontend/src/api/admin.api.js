import api from './axios';

export const adminApi = {
  getStats:         ()                       => api.get('/admin/stats'),
  getUsers:         (params)                 => api.get('/admin/users', { params }),
  getUser:          (userId)                 => api.get(`/admin/users/${userId}`),
  updateUserRole:   (userId, systemRole)     => api.patch(`/admin/users/${userId}/role`, { systemRole }),
  toggleUserActive: (userId)                 => api.patch(`/admin/users/${userId}/toggle-active`),
  deleteUser:       (userId)                 => api.delete(`/admin/users/${userId}`),
  getProjects:      (params)                 => api.get('/admin/projects', { params }),
};
