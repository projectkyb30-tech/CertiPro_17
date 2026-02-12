const express = require('express');
const { stripe } = require('../lib/stripe');
const { env } = require('../config/env');
const { supabaseAdmin } = require('../lib/supabaseAdmin');

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Processing Webhook Event: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const { userId, courseId } = session.metadata;
    const stripeSessionId = session.id;
    const paymentIntentId = session.payment_intent;
    const amountTotal = session.amount_total;
    const currency = session.currency;

    console.log(`Processing purchase for User: ${userId}, Course: ${courseId}`);

    try {
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
        });

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          console.log('Purchase already recorded (idempotency). Skipping.');
          return res.json({ received: true });
        }
        throw error;
      }

      console.log('Purchase recorded successfully.');

    } catch (dbError) {
      console.error('Database Error:', dbError);
      if (dbError.code === '23505' || dbError.message?.includes('duplicate key')) {
        return res.json({ received: true });
      }
      return res.status(500).send('Database Error');
    }
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object;
    const paymentIntentId = charge.payment_intent;

    if (paymentIntentId) {
      const { data: purchase } = await supabaseAdmin
        .from('user_purchases')
        .select('user_id, course_id')
        .eq('payment_intent_id', paymentIntentId)
        .maybeSingle();

      if (purchase?.user_id && purchase?.course_id) {
        console.log(`Processing Refund for User: ${purchase.user_id}, Course: ${purchase.course_id}`);
        await supabaseAdmin
          .from('user_purchases')
          .update({ status: 'refunded' })
          .eq('payment_intent_id', paymentIntentId);

        await supabaseAdmin
          .from('enrollments')
          .delete()
          .eq('user_id', purchase.user_id)
          .eq('course_id', purchase.course_id);
        console.log('Access revoked.');
      } else {
        console.log('Refund event received but no purchase matched payment_intent_id.');
      }
    } else {
      const { userId, courseId } = charge.metadata || {};
      if (userId && courseId) {
        console.log(`Processing Refund for User: ${userId}, Course: ${courseId}`);
        await supabaseAdmin
          .from('user_purchases')
          .update({ status: 'refunded' })
          .eq('user_id', userId)
          .eq('course_id', courseId);

        await supabaseAdmin
          .from('enrollments')
          .delete()
          .eq('user_id', userId)
          .eq('course_id', courseId);
        console.log('Access revoked.');
      } else {
        console.log('Refund event received but metadata missing. Cannot revoke automatically.');
      }
    }
  }

  res.json({ received: true });
});

module.exports = { webhookRouter: router };
