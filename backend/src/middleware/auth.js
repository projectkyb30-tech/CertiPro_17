const { supabaseAdmin } = require('../lib/supabaseAdmin');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    console.error('Auth Error:', error?.message);
    // console.log('Token received:', token.substring(0, 10) + '...');
    return res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
  }

  req.user = user;
  next();
};

module.exports = { authenticateUser };
