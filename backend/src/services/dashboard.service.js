'use strict';

const { Task, Project, ProjectMember, User, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

class DashboardService {
  async getDashboardStats(userId) {
    // Get all projects the user is a member of
    const memberships = await ProjectMember.findAll({ where: { userId } });
    const projectIds = memberships.map((m) => m.projectId);

    if (projectIds.length === 0) {
      return this.emptyStats();
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Parallel queries for performance
    const [
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      overdueTasks,
      myTasks,
      recentTasks,
      projectStats,
    ] = await Promise.all([
      // Total tasks across all user's projects
      Task.count({ where: { projectId: { [Op.in]: projectIds } } }),

      // Tasks grouped by status
      Task.findAll({
        where: { projectId: { [Op.in]: projectIds } },
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group: ['status'],
        raw: true,
      }),

      // Tasks grouped by priority
      Task.findAll({
        where: { projectId: { [Op.in]: projectIds } },
        attributes: ['priority', [fn('COUNT', col('id')), 'count']],
        group: ['priority'],
        raw: true,
      }),

      // Overdue tasks
      Task.count({
        where: {
          projectId: { [Op.in]: projectIds },
          dueDate: { [Op.lt]: today },
          status: { [Op.ne]: 'done' },
        },
      }),

      // Tasks assigned to me
      Task.count({ where: { assigneeId: userId, status: { [Op.ne]: 'done' } } }),

      // Recent tasks (last 5)
      Task.findAll({
        where: { projectId: { [Op.in]: projectIds } },
        include: [
          { model: Project, as: 'project', attributes: ['id', 'name', 'color'] },
          { model: User, as: 'assignee', attributes: ['id', 'name', 'avatar'] },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      }),

      // Per-project task counts
      Task.findAll({
        where: { projectId: { [Op.in]: projectIds } },
        attributes: ['projectId', 'status', [fn('COUNT', col('id')), 'count']],
        group: ['projectId', 'status'],
        raw: true,
      }),
    ]);

    // Format status counts
    const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
    tasksByStatus.forEach((r) => { statusMap[r.status] = parseInt(r.count); });

    // Format priority counts
    const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
    tasksByPriority.forEach((r) => { priorityMap[r.priority] = parseInt(r.count); });

    // Format project stats
    const projectStatsMap = {};
    projectStats.forEach((r) => {
      if (!projectStatsMap[r.projectId]) {
        projectStatsMap[r.projectId] = { todo: 0, in_progress: 0, review: 0, done: 0, total: 0 };
      }
      projectStatsMap[r.projectId][r.status] = parseInt(r.count);
      projectStatsMap[r.projectId].total += parseInt(r.count);
    });

    // Get project details
    const projects = await Project.findAll({
      where: { id: { [Op.in]: projectIds } },
      attributes: ['id', 'name', 'color', 'status', 'dueDate'],
    });

    const projectsWithStats = projects.map((p) => ({
      ...p.toJSON(),
      taskStats: projectStatsMap[p.id] || { todo: 0, in_progress: 0, review: 0, done: 0, total: 0 },
      userRole: memberships.find((m) => m.projectId === p.id)?.role,
    }));

    return {
      summary: {
        totalProjects: projectIds.length,
        totalTasks,
        overdueTasks,
        myPendingTasks: myTasks,
        completedTasks: statusMap.done,
        completionRate: totalTasks > 0 ? Math.round((statusMap.done / totalTasks) * 100) : 0,
      },
      tasksByStatus: statusMap,
      tasksByPriority: priorityMap,
      recentTasks,
      projects: projectsWithStats,
    };
  }

  emptyStats() {
    return {
      summary: {
        totalProjects: 0,
        totalTasks: 0,
        overdueTasks: 0,
        myPendingTasks: 0,
        completedTasks: 0,
        completionRate: 0,
      },
      tasksByStatus: { todo: 0, in_progress: 0, review: 0, done: 0 },
      tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
      recentTasks: [],
      projects: [],
    };
  }
}

module.exports = new DashboardService();
