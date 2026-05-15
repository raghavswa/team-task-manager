'use strict';

const jwt = require('jsonwebtoken');
const { User, ProjectMember } = require('../models');

// Express 5: async middleware errors are automatically forwarded to the error handler

/**
 * Verify JWT access token and attach user to request
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access token required.',
    });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid access token.' });
  }

  const user = await User.findByPk(decoded.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'User not found or inactive.' });
  }

  req.user = user;
  next();
};

/**
 * Check if user is an admin of the given project.
 * Requires authenticate middleware to run first and req.params.projectId or req.params.id to be set.
 */
const requireProjectAdmin = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const userId = req.user.id;

  const membership = await ProjectMember.findOne({ where: { projectId, userId } });

  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Project admin access required.',
    });
  }

  req.membership = membership;
  next();
};

/**
 * Check if user is a member (any role) of the given project.
 */
const requireProjectMember = async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const userId = req.user.id;

  const membership = await ProjectMember.findOne({ where: { projectId, userId } });

  if (!membership) {
    return res.status(403).json({
      success: false,
      message: 'Project membership required.',
    });
  }

  req.membership = membership;
  next();
};

module.exports = { authenticate, requireProjectAdmin, requireProjectMember };
