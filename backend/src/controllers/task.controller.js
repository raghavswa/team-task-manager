'use strict';

const taskService = require('../services/task.service');
const { successResponse } = require('../utils/apiResponse.utils');

// Express 5: async errors are automatically forwarded to the error handler

const getProjectTasks = async (req, res) => {
  const { status, priority, assigneeId, search, overdue } = req.query;
  const tasks = await taskService.getProjectTasks(req.params.projectId, {
    status, priority, assigneeId, search, overdue: overdue === 'true',
  });
  return successResponse(res, { tasks });
};

const createTask = async (req, res) => {
  const { title, description, status, priority, assigneeId, dueDate } = req.body;
  const task = await taskService.createTask(
    { title, description, status, priority, assigneeId, dueDate, projectId: req.params.projectId },
    req.user.id
  );
  return successResponse(res, { task }, 'Task created.', 201);
};

const getTask = async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user.id);
  return successResponse(res, { task });
};

const updateTask = async (req, res) => {
  const { title, description, status, priority, assigneeId, dueDate } = req.body;
  const task = await taskService.updateTask(
    req.params.id,
    { title, description, status, priority, assigneeId, dueDate },
    req.user.id
  );
  return successResponse(res, { task }, 'Task updated.');
};

const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const task = await taskService.updateTaskStatus(req.params.id, status, req.user.id);
  return successResponse(res, { task }, 'Task status updated.');
};

const deleteTask = async (req, res) => {
  await taskService.deleteTask(req.params.id);
  return successResponse(res, {}, 'Task deleted.');
};

const getMyTasks = async (req, res) => {
  const tasks = await taskService.getUserTasks(req.user.id);
  return successResponse(res, { tasks });
};

module.exports = {
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMyTasks,
};
