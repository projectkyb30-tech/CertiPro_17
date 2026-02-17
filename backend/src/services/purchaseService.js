const { supabaseAdmin } = require('../lib/supabaseAdmin');

/**
 * Fetches all paid course IDs for a specific user
 */
async function getUserPurchases(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_purchases')
    .select('course_id')
    .eq('user_id', userId)
    .eq('status', 'paid');

  if (error) throw error;
  return data || [];
}

module.exports = {
  getUserPurchases
};
