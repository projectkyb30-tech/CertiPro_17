const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { getUserProfile } = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

router.get('/auth/me', authenticateUser, async (req, res) => {
  try {
    const supabaseUser = req.user;

    if (!supabaseUser) {
      return sendError(res, 'User not authenticated', 401);
    }

    const role =
      supabaseUser.app_metadata?.role || supabaseUser.user_metadata?.role;

    const profile = await getUserProfile(
      supabaseUser.id,
      supabaseUser.email,
      role
    );

    return sendSuccess(res, profile, 'User profile retrieved');
  } catch (error) {
    console.error('Error in /auth/me:', error);
    return sendError(res, 'Failed to fetch user profile', 500, error.message);
  }
});

module.exports = { authRouter: router };

