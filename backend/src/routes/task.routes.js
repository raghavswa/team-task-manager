'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const {
  getProjectTasks, createTask, getTask,
  updateTask, updateTaskStatus, deleteTask, getMyTasks,
} = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// mergeParams allows access to :projectId from parent router
const router = Router({ mergeParams: true });

// GET /api/tasks/my — tasks assigned to current user (standalone route)
router.get('/my', authenticate, getMyTasks);

// Project-scoped task routes (mounted under /api/projects/:projectId/tasks)
router.get('/', getProjectTasks);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required.').isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'review', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('assigneeId').optional().isUUID().withMessage('Invalid assignee ID.'),
    body('dueDate').optional().isDate().withMessage('Invalid date format.'),
  ],
  validate,
  createTask
);

router.get('/:id', getTask);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'review', 'done']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('assigneeId').optional({ nullable: true }).isUUID(),
    body('dueDate').optional({ nullable: true }).isDate(),
  ],
  validate,
  updateTask
);

router.patch(
  '/:id/status',
  [body('status').isIn(['todo', 'in_progress', 'review', 'done']).withMessage('Invalid status.')],
  validate,
  updateTaskStatus
);

router.delete('/:id', deleteTask);

module.exports = router;
