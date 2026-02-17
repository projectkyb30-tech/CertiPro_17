const { supabaseAdmin } = require('../lib/supabaseAdmin');
const tokenCache = new Map();
const TTL_MS = 15000;

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const now = Date.now();
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > now) {
    req.user = cached.user;
    return next();
  }
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    console.error('Auth Error:', error?.message);
    // console.log('Token received:', token.substring(0, 10) + '...');
    return res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
  }

  req.user = user;
  tokenCache.set(token, { user, expiresAt: now + TTL_MS });
  next();
};

module.exports = { authenticateUser };
