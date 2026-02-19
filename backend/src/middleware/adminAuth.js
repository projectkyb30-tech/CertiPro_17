const { supabaseAdmin } = require('../lib/supabaseAdmin');

const requireAdmin = async (req, res, next) => {
  try {
    const user = req.user; // Assumes authenticateUser runs first

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin role in app_metadata ONLY
    // SECURITY: user_metadata is writable by the client, so NEVER use it for authorization
    // Only app_metadata (set via service_role key or Supabase dashboard) is trustworthy
    const isAdmin = user.app_metadata?.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { requireAdmin };
