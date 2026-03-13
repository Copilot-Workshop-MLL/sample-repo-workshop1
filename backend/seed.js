/**
 * Seed script: creates Admin role (full access) + User role (view-only),
 * then creates two users: admin@rbac.com / Admin@123 and user@rbac.com / User@123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');
const { MODULES, flattenModules } = require('./src/config/modules.config');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_db';

const buildPermissions = (allTrue) =>
  flattenModules(MODULES).map((mod) => ({
    module: mod.key,
    view: allTrue,
    create: allTrue,
    edit: allTrue,
    delete: allTrue,
    export: allTrue,
    import: allTrue,
    search: allTrue,
  }));

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clean existing seed data
  await User.deleteMany({ email: { $in: ['admin@rbac.com', 'user@rbac.com'] } });
  await Role.deleteMany({ name: { $in: ['Admin', 'Viewer'] } });

  // Create roles
  const adminRole = await Role.create({
    name: 'Admin',
    description: 'Full access to all modules',
    permissions: buildPermissions(true),
  });

  const viewerRole = await Role.create({
    name: 'Viewer',
    description: 'View-only access to all modules',
    permissions: buildPermissions(false).map((p) => ({ ...p, view: true })),
  });

  console.log('Roles created:', adminRole.name, viewerRole.name);

  // Create users (password hashed automatically by User model pre-save hook)
  const adminUser = await User.create({
    name: 'Admin',
    email: 'admin@rbac.com',
    password: 'Admin@123',
    roles: [adminRole._id],
  });

  const regularUser = await User.create({
    name: 'User',
    email: 'user@rbac.com',
    password: 'User@123',
    roles: [viewerRole._id],
  });

  console.log('Users created:');
  console.log('  Admin  -> email: admin@rbac.com  | password: Admin@123');
  console.log('  User   -> email: user@rbac.com   | password: User@123');

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
