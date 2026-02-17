const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { getUserPurchases } = require('../services/purchaseService');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

router.get('/user-purchases/:userId', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return sendError(res, 'Unauthorized access to user data', 403);
    }

    const data = await getUserPurchases(userId);
    sendSuccess(res, data, 'User purchases retrieved successfully');
  } catch (error) {
    console.error('Error fetching purchases:', error);
    sendError(res, error.message);
  }
});

module.exports = { purchasesRouter: router };
