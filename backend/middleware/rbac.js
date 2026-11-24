const { get } = require('../database/db');

// Unit 3: Simple Role-Based Access Control (RBAC) middleware
function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    const userId = parseInt(req.headers['x-user-id'] || req.body?.user_id || req.body?.organizer_id, 10);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required (missing x-user-id).' });
    }

    const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid user account.' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied: '${user.role}' cannot perform this action. Required: ${allowedRoles.join(' or ')}.`
      });
    }

    req.user = user;
    next();
  };
}

module.exports = { requireRole };
