'use strict';

const { Router } = require('express');
const { body, param } = require('express-validator');
const {
  getProjects, createProject, getProject, updateProject,
  deleteProject, addMember, removeMember, updateMemberRole,
} = require('../controllers/project.controller');
const { authenticate, requireProjectAdmin, requireProjectMember } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const taskRoutes = require('./task.routes');

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.get('/', getProjects);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Project name is required.').isLength({ max: 150 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('dueDate').optional().isDate().withMessage('Invalid date format.'),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color hex.'),
  ],
  validate,
  createProject
);

router.get('/:id', getProject);

router.put(
  '/:id',
  requireProjectAdmin,
  [
    body('name').optional().trim().notEmpty().isLength({ max: 150 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('status').optional().isIn(['active', 'archived', 'completed']),
    body('dueDate').optional().isDate(),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  validate,
  updateProject
);

router.delete('/:id', requireProjectAdmin, deleteProject);

// Member management
router.post(
  '/:id/members',
  requireProjectAdmin,
  [
    body('email').trim().isEmail().withMessage('Valid email is required.'),
    body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member.'),
  ],
  validate,
  addMember
);

router.delete('/:id/members/:userId', requireProjectAdmin, removeMember);

router.patch(
  '/:id/members/:userId/role',
  requireProjectAdmin,
  [body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member.')],
  validate,
  updateMemberRole
);

// Nested task routes: /api/projects/:projectId/tasks
router.use('/:projectId/tasks', requireProjectMember, taskRoutes);

module.exports = router;
