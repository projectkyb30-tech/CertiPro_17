const Stripe = require('stripe');
const { env } = require('../config/env');

const stripe = env.STRIPE_SECRET_KEY ? Stripe(env.STRIPE_SECRET_KEY) : null;

module.exports = { stripe };
