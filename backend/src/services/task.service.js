'use strict';

const { Task, User, Project, ProjectMember } = require('../models');
const { Op } = require('sequelize');

const TASK_INCLUDE = [
  { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
  { model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar'] },
];

class TaskService {
  async getProjectTasks(projectId, filters = {}) {
    const where = { projectId };

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      where.title = { [Op.iLike]: `%${filters.search}%` };
    }
    if (filters.overdue) {
      where.dueDate = { [Op.lt]: new Date() };
      where.status = { [Op.ne]: 'done' };
    }

    const tasks = await Task.findAll({
      where,
      include: TASK_INCLUDE,
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    return tasks;
  }

  async createTask({ title, description, status, priority, assigneeId, dueDate, projectId }, creatorId) {
    // Validate assignee is a project member
    if (assigneeId) {
      const isMember = await ProjectMember.findOne({ where: { projectId, userId: assigneeId } });
      if (!isMember) {
        const err = new Error('Assignee must be a member of this project.');
        err.statusCode = 400;
        throw err;
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assigneeId,
      dueDate,
      projectId,
      creatorId,
    });

    return Task.findByPk(task.id, { include: TASK_INCLUDE });
  }

  async getTaskById(taskId, userId) {
    const task = await Task.findByPk(taskId, {
      include: [
        ...TASK_INCLUDE,
        { model: Project, as: 'project', attributes: ['id', 'name'] },
      ],
    });

    if (!task) {
      const err = new Error('Task not found.');
      err.statusCode = 404;
      throw err;
    }

    // Verify user has access to the project
    const membership = await ProjectMember.findOne({
      where: { projectId: task.projectId, userId },
    });
    if (!membership) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      throw err;
    }

    return task;
  }

  async updateTask(taskId, updates, userId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      const err = new Error('Task not found.');
      err.statusCode = 404;
      throw err;
    }

    // Validate new assignee is a project member
    if (updates.assigneeId) {
      const isMember = await ProjectMember.findOne({
        where: { projectId: task.projectId, userId: updates.assigneeId },
      });
      if (!isMember) {
        const err = new Error('Assignee must be a member of this project.');
        err.statusCode = 400;
        throw err;
      }
    }

    await task.update(updates);
    return Task.findByPk(taskId, { include: TASK_INCLUDE });
  }

  async updateTaskStatus(taskId, status, userId) {
    return this.updateTask(taskId, { status }, userId);
  }

  async deleteTask(taskId) {
    const task = await Task.findByPk(taskId);
    if (!task) {
      const err = new Error('Task not found.');
      err.statusCode = 404;
      throw err;
    }
    await task.destroy();
  }

  async getUserTasks(userId) {
    return Task.findAll({
      where: { assigneeId: userId },
      include: [
        ...TASK_INCLUDE,
        { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
      ],
      order: [['dueDate', 'ASC NULLS LAST'], ['createdAt', 'DESC']],
    });
  }
}

module.exports = new TaskService();
