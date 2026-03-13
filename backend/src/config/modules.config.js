/**
 * Static list of all application modules/screens.
 * Each module maps to a row in the permission matrix UI.
 * To add a new module, simply add an entry here.
 */
const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  {
    key: 'users', label: 'Users', children: [
      { key: 'users.list',   label: 'User List' },
      { key: 'users.create', label: 'Create User' },
    ],
  },
  {
    key: 'roles', label: 'Roles', children: [
      { key: 'roles.list',   label: 'Role List' },
      { key: 'roles.create', label: 'Create Role' },
    ],
  },
  {
    key: 'products', label: 'Products', children: [
      { key: 'products.list',       label: 'Product List' },
      { key: 'products.categories', label: 'Categories' },
    ],
  },
  {
    key: 'orders', label: 'Orders', children: [
      { key: 'orders.all',     label: 'All Orders' },
      { key: 'orders.pending', label: 'Pending Orders' },
    ],
  },
  {
    key: 'reports', label: 'Reports', children: [
      { key: 'reports.sales',     label: 'Sales Report' },
      { key: 'reports.inventory', label: 'Inventory Report' },
    ],
  },
  {
    key: 'settings', label: 'Settings', children: [
      { key: 'settings.profile', label: 'Profile' },
      { key: 'settings.system',  label: 'System Settings' },
    ],
  },
];

const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'import', 'search'];

/** Returns flat array of all leaf-level module definitions */
const flattenModules = (mods) =>
  mods.flatMap((m) => (m.children && m.children.length ? m.children : [m]));

module.exports = { MODULES, ACTIONS, flattenModules };
