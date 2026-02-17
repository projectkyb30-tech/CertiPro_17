const { stripe } = require('../lib/stripe');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { getCourseDetails } = require('./courses');

async function withRetry(fn, options = {}) {
  const {
    retries = 3,
    delayMs = 200,
    factor = 2,
    shouldRetry
  } = options;
  let attempt = 0;
  let currentDelay = delayMs;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      const canRetry = attempt <= retries && (!shouldRetry || shouldRetry(error));
      if (!canRetry) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= factor;
    }
  }
}

/**
 * Creates a Stripe checkout session for a course purchase
 */
async function createCheckoutSession({ courseId, userId, email, baseUrl }) {
  const course = await getCourseDetails(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  if (!stripe) {
    throw new Error('Stripe is not configured on this server');
  }

  return await stripe.checkout.sessions.create({
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
}

/**
 * Verifies a Stripe payment and enrolls the user
 */
async function verifyPayment(sessionId, authenticatedUserId) {
  if (!stripe) {
    throw new Error('Stripe is not configured on this server');
  }

  const session = await withRetry(
    () => stripe.checkout.sessions.retrieve(sessionId),
    {
      retries: 2,
      delayMs: 300,
      shouldRetry: (error) =>
        error &&
        (error.type === 'StripeAPIError' ||
          error.type === 'StripeConnectionError' ||
          error.code === 'ETIMEDOUT')
    }
  );

  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed');
  }

  const { userId, courseId } = session.metadata;
  
  if (authenticatedUserId !== userId) {
    throw new Error('Unauthorized verification attempt');
  }

  // Record purchase
  const { error: purchaseError } = await supabaseAdmin
    .from('user_purchases')
    .insert({
      user_id: userId,
      course_id: courseId,
      stripe_session_id: session.id,
      payment_intent_id: session.payment_intent,
      amount_total: session.amount_total,
      currency: session.currency,
      status: 'paid'
    });

  if (purchaseError) {
    // Handle duplicate key (already paid/enrolled)
    if (purchaseError.code === '23505' || purchaseError.message?.includes('duplicate key')) {
      return await ensureEnrollment(userId, courseId, 'Already unlocked');
    }
    throw purchaseError;
  }

  return await ensureEnrollment(userId, courseId, 'Course unlocked successfully');
}

/**
 * Syncs a purchase if enrollment is missing
 */
async function syncPurchase(userId, courseId) {
  const { data: purchase } = await supabaseAdmin
    .from('user_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'paid')
    .maybeSingle();

  if (!purchase) {
    throw new Error('No valid purchase found');
  }

  return await ensureEnrollment(userId, courseId, 'Account synced successfully');
}

/**
 * Helper to ensure a user is enrolled in a course
 */
async function ensureEnrollment(userId, courseId, successMessage) {
  const { data: enrollment } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (enrollment) {
    return { success: true, message: 'Already enrolled' };
  }

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

  return { success: true, message: successMessage };
}

/**
 * Handles Stripe webhook events
 */
async function handleWebhookEvent(event) {
  console.log(`Processing Webhook Event in Service: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, courseId } = session.metadata;

    if (!userId || !courseId) {
      console.warn('Webhook received checkout.session.completed but metadata is missing.');
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from('user_purchases')
        .insert({
          user_id: userId,
          course_id: courseId,
          stripe_session_id: session.id,
          payment_intent_id: session.payment_intent,
          amount_total: session.amount_total,
          currency: session.currency,
          status: 'paid'
        });

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate key')) {
          console.log('Purchase already recorded (idempotency). Skipping.');
          return;
        }
        throw error;
      }

      await ensureEnrollment(userId, courseId, 'Course unlocked via webhook');
      console.log('Purchase recorded and user enrolled successfully.');
    } catch (error) {
      console.error('Error processing checkout session webhook:', error);
      throw error;
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
        await revokeAccess(purchase.user_id, purchase.course_id, paymentIntentId);
      } else {
        console.log('Refund event received but no purchase matched payment_intent_id.');
      }
    } else {
      const { userId, courseId } = charge.metadata || {};
      if (userId && courseId) {
        await revokeAccess(userId, courseId);
      } else {
        console.log('Refund event received but metadata missing. Cannot revoke automatically.');
      }
    }
  }
}

/**
 * Revokes access to a course (refund cleanup)
 */
async function revokeAccess(userId, courseId, paymentIntentId = null) {
  console.log(`Revoking access for User: ${userId}, Course: ${courseId}`);

  const updateQuery = supabaseAdmin
    .from('user_purchases')
    .update({ status: 'refunded' });
  
  if (paymentIntentId) {
    updateQuery.eq('payment_intent_id', paymentIntentId);
  } else {
    updateQuery.eq('user_id', userId).eq('course_id', courseId);
  }

  await updateQuery;

  // Remove enrollment and related data
  await supabaseAdmin
    .from('enrollments')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);

  await supabaseAdmin
    .from('user_progress')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);

  await supabaseAdmin
    .from('exam_attempts')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId);

  console.log('Access revoked and progress cleaned up.');
}

module.exports = {
  createCheckoutSession,
  verifyPayment,
  syncPurchase,
  ensureEnrollment,
  handleWebhookEvent,
  revokeAccess,
  withRetry
};
