const { validationResult } = require('express-validator');
const Role = require('../models/Role');

// GET /api/roles
const getRoles = async (req, res) => {
  const roles = await Role.find().sort({ createdAt: -1 });
  return res.status(200).json(roles);
};

// GET /api/roles/:id
const getRoleById = async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });
  return res.status(200).json(role);
};

// POST /api/roles
const createRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, permissions } = req.body;

  const existing = await Role.findOne({ name });
  if (existing) {
    return res.status(400).json({ message: 'Role name already exists' });
  }

  const role = await Role.create({ name, description, permissions });
  return res.status(201).json(role);
};

// PUT /api/roles/:id
const updateRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, permissions } = req.body;

  const role = await Role.findByIdAndUpdate(
    req.params.id,
    { name, description, permissions },
    { new: true, runValidators: true }
  );

  if (!role) return res.status(404).json({ message: 'Role not found' });
  return res.status(200).json(role);
};

// DELETE /api/roles/:id
const deleteRole = async (req, res) => {
  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) return res.status(404).json({ message: 'Role not found' });
  return res.status(204).send();
};

module.exports = { getRoles, getRoleById, createRole, updateRole, deleteRole };
