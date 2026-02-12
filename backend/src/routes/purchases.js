const express = require('express');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

router.get('/user-purchases/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to user data' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_purchases')
      .select('course_id')
      .eq('user_id', userId)
      .eq('status', 'paid');

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { purchasesRouter: router };
