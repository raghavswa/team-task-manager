'use strict';

const projectService = require('../services/project.service');
const { successResponse } = require('../utils/apiResponse.utils');

// Express 5: async errors are automatically forwarded to the error handler

const getProjects = async (req, res) => {
  const projects = await projectService.getUserProjects(req.user.id);
  return successResponse(res, { projects });
};

const createProject = async (req, res) => {
  const { name, description, dueDate, color } = req.body;
  const project = await projectService.createProject(
    { name, description, dueDate, color },
    req.user.id
  );
  return successResponse(res, { project }, 'Project created.', 201);
};

const getProject = async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user.id);
  return successResponse(res, { project });
};

const updateProject = async (req, res) => {
  const { name, description, dueDate, color, status } = req.body;
  const project = await projectService.updateProject(req.params.id, {
    name, description, dueDate, color, status,
  });
  return successResponse(res, { project }, 'Project updated.');
};

const deleteProject = async (req, res) => {
  await projectService.deleteProject(req.params.id);
  return successResponse(res, {}, 'Project deleted.');
};

const addMember = async (req, res) => {
  const { email, role } = req.body;
  const membership = await projectService.addMember(
    req.params.id, email, role, req.user.id
  );
  return successResponse(res, { membership }, 'Member added.', 201);
};

const removeMember = async (req, res) => {
  await projectService.removeMember(req.params.id, req.params.userId, req.user.id);
  return successResponse(res, {}, 'Member removed.');
};

const updateMemberRole = async (req, res) => {
  const { role } = req.body;
  const membership = await projectService.updateMemberRole(
    req.params.id, req.params.userId, role
  );
  return successResponse(res, { membership }, 'Member role updated.');
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
};
