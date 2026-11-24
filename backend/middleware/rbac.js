const { get } = require('../database/db');

/**
 * Resolves the acting user from `x-user-id` header (falling back to body.user_id / body.organizer_id)
 * and enforces Role-Based Access Control (Unit 3: RBAC).
 */
function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      const rawId =
        req.headers['x-user-id'] ||
        req.body?.user_id ||
        req.body?.organizer_id;

      const userId = parseInt(rawId, 10);
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required: missing x-user-id header.'
        });
      }

      const user = await get(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId]
      );
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid user account.'
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied (RBAC): '${user.role}' role cannot perform this action. Required: ${allowedRoles.join(' or ')}.`
        });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('RBAC middleware error:', err);
      res.status(500).json({ success: false, error: 'Authorization check failed.' });
    }
  };
}

module.exports = { requireRole };
