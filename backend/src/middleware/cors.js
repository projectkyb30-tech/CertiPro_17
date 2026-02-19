const cors = require('cors');
const { env } = require('../config/env');

const allowedOrigins = (env.ALLOWED_ORIGINS || env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0) {
      console.error(
        'CORS middleware: no ALLOWED_ORIGINS or FRONTEND_URL configured — blocking request. Set ALLOWED_ORIGINS or FRONTEND_URL env var.'
      );
      return callback(new Error('CORS not configured: no allowed origins specified'));
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

module.exports = { corsMiddleware };
