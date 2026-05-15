'use strict';

const adminService = require('../services/admin.service');
const { successResponse } = require('../utils/apiResponse.utils');

const getStats = async (req, res) => {
  const stats = await adminService.getSystemStats();
  return successResponse(res, stats);
};

const getUsers = async (req, res) => {
  const { page, limit, search, role, isActive } = req.query;
  const result = await adminService.getAllUsers({ page, limit, search, role, isActive });
  return successResponse(res, result);
};

const getUser = async (req, res) => {
  const user = await adminService.getUserById(req.params.userId);
  return successResponse(res, { user });
};

const updateUserRole = async (req, res) => {
  const { systemRole } = req.body;
  const user = await adminService.updateUserRole(req.params.userId, systemRole, req.user.id);
  return successResponse(res, { user }, 'User role updated.');
};

const toggleUserActive = async (req, res) => {
  const user = await adminService.toggleUserActive(req.params.userId, req.user.id);
  return successResponse(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'}.`);
};

const deleteUser = async (req, res) => {
  await adminService.deleteUser(req.params.userId, req.user.id);
  return successResponse(res, {}, 'User deleted.');
};

const getProjects = async (req, res) => {
  const { page, limit, search, status } = req.query;
  const result = await adminService.getAllProjects({ page, limit, search, status });
  return successResponse(res, result);
};

module.exports = { getStats, getUsers, getUser, updateUserRole, toggleUserActive, deleteUser, getProjects };
