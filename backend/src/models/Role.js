const mongoose = require('mongoose');
const { MODULES, ACTIONS } = require('../config/modules.config');

// Build default permissions for every module (all false)
const buildDefaultPermissions = () =>
  MODULES.map(({ key }) => {
    const perm = { module: key };
    ACTIONS.forEach((action) => { perm[action] = false; });
    return perm;
  });

const permissionSchema = new mongoose.Schema(
  {
    module: { type: String, required: true },
    view:   { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit:   { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
    import: { type: Boolean, default: false },
    search: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    description: { type: String, trim: true, default: '' },
    permissions: {
      type: [permissionSchema],
      default: buildDefaultPermissions,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
