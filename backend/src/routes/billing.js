const express = require('express');
const { env } = require('../config/env');
const { authenticateUser } = require('../middleware/auth');
const { validate, checkoutSchema, verifyPaymentSchema, syncPurchaseSchema } = require('../utils/validation');
const { createCheckoutSession, verifyPayment, syncPurchase } = require('../services/billingService');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

router.post('/create-checkout-session', authenticateUser, validate(checkoutSchema), async (req, res) => {
  try {
    const { courseId, userId, email } = req.body;

    if (req.user.id !== userId) {
      return sendError(res, 'Unauthorized purchase attempt', 403);
    }

    let baseUrl = env.FRONTEND_URL || 'http://localhost:5173';
    try {
      if (req.headers.referer) {
        const url = new URL(req.headers.referer);
        baseUrl = url.origin;
      }
    } catch (e) {
      console.warn('Could not parse referer, using default:', baseUrl);
    }

    const session = await createCheckoutSession({ courseId, userId, email, baseUrl });
    sendSuccess(res, { url: session.url }, 'Checkout session created');
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const statusCode = error.message === 'Course not found' ? 404 : 500;
    sendError(res, error.message, statusCode);
  }
});

router.post('/verify-payment', authenticateUser, validate(verifyPaymentSchema), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const result = await verifyPayment(sessionId, req.user.id);
    sendSuccess(res, result, 'Payment verified successfully');
  } catch (error) {
    console.error('Error verifying payment:', error);
    
    if (error.message === 'Unauthorized verification attempt') {
      return sendError(res, error.message, 403);
    }
    
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      return sendSuccess(res, { success: true }, 'Already unlocked (race condition handled)');
    }
    
    sendError(res, error.message);
  }
});

router.post('/sync-purchase', authenticateUser, validate(syncPurchaseSchema), async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (req.user.id !== userId) {
      return sendError(res, 'Unauthorized sync attempt', 403);
    }

    const result = await syncPurchase(userId, courseId);
    sendSuccess(res, result, 'Purchase synced successfully');
  } catch (error) {
    console.error('Error in sync-purchase:', error);
    const statusCode = error.message === 'No valid purchase found' ? 400 : 500;
    sendError(res, error.message, statusCode);
  }
});

module.exports = { billingRouter: router };
