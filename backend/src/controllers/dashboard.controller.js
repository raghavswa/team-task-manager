'use strict';

const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/apiResponse.utils');

// Express 5: async errors are automatically forwarded to the error handler

const getDashboard = async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user.id);
  return successResponse(res, stats);
};

module.exports = { getDashboard };
