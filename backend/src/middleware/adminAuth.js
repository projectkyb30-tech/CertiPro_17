const { supabaseAdmin } = require('../lib/supabaseAdmin');

const requireAdmin = async (req, res, next) => {
  try {
    const user = req.user; // Assumes authenticateUser runs first

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin role in metadata
    // DO NOT use email-based checks as they are insecure and easily spoofed
    const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.is_admin === true;

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
