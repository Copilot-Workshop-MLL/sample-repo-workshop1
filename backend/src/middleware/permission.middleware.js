/**
 * checkPermission(module, action)
 * Factory that returns an Express middleware.
 * Merges permissions across all roles the user holds (union — most permissive).
 *
 * Usage: router.get('/users', authMiddleware, checkPermission('users', 'view'), handler)
 */
const checkPermission = (module, action) => (req, res, next) => {
  const { roles } = req.user;

  if (!roles || roles.length === 0) {
    return res.status(403).json({ message: 'Access denied: no roles assigned' });
  }

  const hasAccess = roles.some((role) => {
    const perm = role.permissions.find((p) => p.module === module);
    return perm && perm[action] === true;
  });

  if (!hasAccess) {
    return res.status(403).json({
      message: `Access denied: '${action}' on '${module}' not permitted`,
    });
  }

  next();
};

module.exports = { checkPermission };
