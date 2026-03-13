const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

const router = express.Router();

const userCreateValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const userUpdateValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
];

router.get('/', authMiddleware, checkPermission('users', 'view'), getUsers);
router.get('/:id', authMiddleware, checkPermission('users', 'view'), getUserById);
router.post('/', authMiddleware, checkPermission('users', 'create'), userCreateValidation, createUser);
router.put('/:id', authMiddleware, checkPermission('users', 'edit'), userUpdateValidation, updateUser);
router.delete('/:id', authMiddleware, checkPermission('users', 'delete'), deleteUser);

module.exports = router;
