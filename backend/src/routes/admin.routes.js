'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const {
  getStats, getUsers, getUser,
  updateUserRole, toggleUserActive, deleteUser, getProjects,
} = require('../controllers/admin.controller');
const { authenticate, requireSuperAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

// All admin routes require authentication + superadmin role
router.use(authenticate, requireSuperAdmin);

// System stats
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.get('/users/:userId', getUser);

router.patch(
  '/users/:userId/role',
  [body('systemRole').isIn(['superadmin', 'user']).withMessage('Role must be superadmin or user.')],
  validate,
  updateUserRole
);

router.patch('/users/:userId/toggle-active', toggleUserActive);

router.delete('/users/:userId', deleteUser);

// Project oversight
router.get('/projects', getProjects);

module.exports = router;
