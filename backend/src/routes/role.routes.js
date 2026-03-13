const express = require('express');
const { body } = require('express-validator');
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/role.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

const router = express.Router();

const roleValidation = [
  body('name').notEmpty().withMessage('Role name is required'),
];

router.get('/', authMiddleware, checkPermission('roles', 'view'), getRoles);
router.get('/:id', authMiddleware, checkPermission('roles', 'view'), getRoleById);
router.post('/', authMiddleware, checkPermission('roles', 'create'), roleValidation, createRole);
router.put('/:id', authMiddleware, checkPermission('roles', 'edit'), roleValidation, updateRole);
router.delete('/:id', authMiddleware, checkPermission('roles', 'delete'), deleteRole);

module.exports = router;
