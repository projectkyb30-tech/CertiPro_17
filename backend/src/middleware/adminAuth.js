const { supabaseAdmin } = require('../lib/supabaseAdmin');

const requireAdmin = async (req, res, next) => {
  try {
    const user = req.user; // Assumes authenticateUser runs first

    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if user has admin role in metadata
    // OR if email is in allowed list (fallback)
    const isAdmin = 
      user.app_metadata?.role === 'admin' || 
      user.email?.endsWith('@certipro.com') ||
      user.email === 'admin@example.com';

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
