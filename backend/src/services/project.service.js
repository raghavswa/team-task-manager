'use strict';

const { Project, ProjectMember, User, Task, sequelize } = require('../models');
const { Op } = require('sequelize');

class ProjectService {
  async getUserProjects(userId) {
    // Get projects where user is a member
    const memberships = await ProjectMember.findAll({
      where: { userId },
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
          ],
        },
      ],
    });

    return memberships.map((m) => ({
      ...m.project.toJSON(),
      userRole: m.role,
    }));
  }

  async createProject({ name, description, dueDate, color }, ownerId) {
    const t = await sequelize.transaction();
    try {
      const project = await Project.create(
        { name, description, dueDate, color, ownerId },
        { transaction: t }
      );

      // Owner is automatically an admin member
      await ProjectMember.create(
        { projectId: project.id, userId: ownerId, role: 'admin' },
        { transaction: t }
      );

      await t.commit();

      return this.getProjectById(project.id, ownerId);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async getProjectById(projectId, userId) {
    const project = await Project.findByPk(projectId, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: ProjectMember,
          as: 'projectMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }],
        },
      ],
    });

    if (!project) {
      const err = new Error('Project not found.');
      err.statusCode = 404;
      throw err;
    }

    const membership = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!membership) {
      const err = new Error('Access denied.');
      err.statusCode = 403;
      throw err;
    }

    return { ...project.toJSON(), userRole: membership.role };
  }

  async updateProject(projectId, updates) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      const err = new Error('Project not found.');
      err.statusCode = 404;
      throw err;
    }

    await project.update(updates);
    return project;
  }

  async deleteProject(projectId) {
    const project = await Project.findByPk(projectId);
    if (!project) {
      const err = new Error('Project not found.');
      err.statusCode = 404;
      throw err;
    }
    await project.destroy();
  }

  async addMember(projectId, email, role = 'member', requesterId) {
    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      const err = new Error('User with that email not found.');
      err.statusCode = 404;
      throw err;
    }

    const existing = await ProjectMember.findOne({ where: { projectId, userId: user.id } });
    if (existing) {
      const err = new Error('User is already a member of this project.');
      err.statusCode = 409;
      throw err;
    }

    const membership = await ProjectMember.create({ projectId, userId: user.id, role });
    return { ...membership.toJSON(), user: { id: user.id, name: user.name, email: user.email } };
  }

  async removeMember(projectId, userId, requesterId) {
    if (userId === requesterId) {
      const err = new Error('You cannot remove yourself. Transfer ownership first.');
      err.statusCode = 400;
      throw err;
    }

    const membership = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!membership) {
      const err = new Error('Member not found in this project.');
      err.statusCode = 404;
      throw err;
    }

    await membership.destroy();
  }

  async updateMemberRole(projectId, userId, role) {
    const membership = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!membership) {
      const err = new Error('Member not found.');
      err.statusCode = 404;
      throw err;
    }
    await membership.update({ role });
    return membership;
  }
}

module.exports = new ProjectService();
