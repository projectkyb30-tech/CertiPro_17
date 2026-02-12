const express = require('express');
const { stripe } = require('../lib/stripe');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { env } = require('../config/env');
const { authenticateUser } = require('../middleware/auth');
const { getCourseDetails } = require('../services/courses');

const router = express.Router();

router.post('/create-checkout-session', authenticateUser, async (req, res) => {
  try {
    const { courseId, userId, email } = req.body;

    if (!courseId || !userId) {
      return res.status(400).json({ error: 'Missing courseId or userId' });
    }

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized purchase attempt' });
    }

    const course = await getCourseDetails(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured on this server' });
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: course.name,
              metadata: {
                courseId: courseId
              }
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        courseId: courseId,
        userId: userId
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-payment', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }

    if (!stripe) {
      return res.status(503).json({ error: 'Stripe is not configured on this server' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const { userId, courseId } = session.metadata;
    const stripeSessionId = session.id;
    const paymentIntentId = session.payment_intent;
    const amountTotal = session.amount_total;
    const currency = session.currency;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized verification attempt' });
    }

    const { error } = await supabaseAdmin
      .from('user_purchases')
      .insert({
        user_id: userId,
        course_id: courseId,
        stripe_session_id: stripeSessionId,
        payment_intent_id: paymentIntentId,
        amount_total: amountTotal,
        currency: currency,
        status: 'paid'
      })
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        const { data: enrollment } = await supabaseAdmin
          .from('enrollments')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', courseId)
          .maybeSingle();

        if (!enrollment) {
          console.warn(`[Self-Healing] Purchase exists but Enrollment missing for User ${userId}, Course ${courseId}. Creating manually.`);
          const { error: enrollError } = await supabaseAdmin
            .from('enrollments')
            .insert({
              user_id: userId,
              course_id: courseId,
              enrolled_at: new Date(),
              progress_percent: 0,
              is_completed: false
            });

          if (enrollError) {
            console.error('[Self-Healing] Failed to create enrollment:', enrollError);
          } else {
            return res.json({ success: true, message: 'Course unlocked (Self-Healed)' });
          }
        }

        return res.json({ success: true, message: 'Already unlocked' });
      }
      throw error;
    }

    res.json({ success: true, message: 'Course unlocked successfully' });

  } catch (error) {
    console.error('Error verifying payment:', error);
    if (error.code === '23505' || error.message?.includes('duplicate key')) {
      return res.json({ success: true, message: 'Already unlocked (race condition handled)' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync-purchase', authenticateUser, async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized sync attempt' });
    }

    const { data: purchase } = await supabaseAdmin
      .from('user_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('status', 'paid')
      .maybeSingle();

    if (!purchase) {
      return res.status(400).json({ success: false, message: 'No valid purchase found.' });
    }

    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    if (enrollment) {
      return res.json({ success: true, message: 'Already enrolled.' });
    }

    console.warn(`[Sync-Purchase] Creating missing enrollment for User ${userId}, Course ${courseId}.`);
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date(),
        progress_percent: 0,
        is_completed: false
      });

    if (enrollError) {
      throw enrollError;
    }

    return res.json({ success: true, message: 'Account synced successfully.' });

  } catch (error) {
    console.error('Error in sync-purchase:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { billingRouter: router };
