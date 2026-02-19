const { supabaseAdmin } = require('../lib/supabaseAdmin');

const TOKEN_CACHE_MAX_SIZE = 1000;
const TOKEN_CACHE_TTL_MS = 15000;
const tokenCache = new Map();

// Periodic cleanup of expired tokens (every 60 seconds)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of tokenCache) {
    if (entry.expiresAt <= now) {
      tokenCache.delete(token);
    }
  }
}, 60000);
// Allow process to exit without waiting for cleanup
if (cleanupInterval.unref) cleanupInterval.unref();

/** Invalidate a specific token from cache (e.g. on logout) */
const invalidateToken = (token) => {
  tokenCache.delete(token);
};

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
    return res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
  }

  req.user = user;

  // Enforce max cache size — evict oldest entries if exceeded
  if (tokenCache.size >= TOKEN_CACHE_MAX_SIZE) {
    const firstKey = tokenCache.keys().next().value;
    tokenCache.delete(firstKey);
  }
  tokenCache.set(token, { user, expiresAt: now + TOKEN_CACHE_TTL_MS });
  next();
};

module.exports = { authenticateUser, invalidateToken };

