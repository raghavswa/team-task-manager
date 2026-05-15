'use strict';

const { User, Project, Task, ProjectMember, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');

class AdminService {
  async getAllUsers({ page = 1, limit = 20, search, role, isActive }) {
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.systemRole = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: ProjectMember,
          include: [{ model: Project, as: 'project', attributes: ['id', 'name', 'color', 'status'] }],
        },
      ],
    });
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async updateUserRole(userId, systemRole, requesterId) {
    if (userId === requesterId) {
      const err = new Error('You cannot change your own system role.');
      err.statusCode = 400;
      throw err;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    await user.update({ systemRole });
    return user;
  }

  async toggleUserActive(userId, requesterId) {
    if (userId === requesterId) {
      const err = new Error('You cannot deactivate your own account.');
      err.statusCode = 400;
      throw err;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    await user.update({ isActive: !user.isActive });
    return user;
  }

  async deleteUser(userId, requesterId) {
    if (userId === requesterId) {
      const err = new Error('You cannot delete your own account.');
      err.statusCode = 400;
      throw err;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    await user.destroy();
  }

  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      superAdmins,
      totalProjects,
      activeProjects,
      totalTasks,
      tasksByStatus,
      recentUsers,
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { systemRole: 'superadmin' } }),
      Project.count(),
      Project.count({ where: { status: 'active' } }),
      Task.count(),
      Task.findAll({
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),
      User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'email', 'systemRole', 'isActive', 'createdAt'],
      }),
    ]);

    const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
    tasksByStatus.forEach((r) => { statusMap[r.status] = parseInt(r.count); });

    return {
      users: { total: totalUsers, active: activeUsers, inactive: totalUsers - activeUsers, superAdmins },
      projects: { total: totalProjects, active: activeProjects },
      tasks: { total: totalTasks, byStatus: statusMap },
      recentUsers,
    };
  }

  async getAllProjects({ page = 1, limit = 20, search, status }) {
    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await Project.findAndCountAll({
      where,
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: ProjectMember, as: 'projectMembers', attributes: ['id', 'role', 'userId'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      projects: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(count / limit) },
    };
  }
}

module.exports = new AdminService();
