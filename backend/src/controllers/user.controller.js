const { validationResult } = require('express-validator');
const User = require('../models/User');

// GET /api/users
const getUsers = async (req, res) => {
  const users = await User.find().populate('roles', 'name description').sort({ createdAt: -1 });
  return res.status(200).json(users);
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).populate('roles', 'name description');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.status(200).json(user);
};

// POST /api/users
const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, roles } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, roles: roles || [] });
  await user.populate('roles', 'name description');
  return res.status(201).json(user);
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, roles, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, roles, isActive },
    { new: true, runValidators: true }
  ).populate('roles', 'name description');

  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.status(200).json(user);
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.status(204).send();
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
