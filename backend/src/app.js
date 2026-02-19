const express = require('express');
const helmet = require('helmet');
const { corsMiddleware } = require('./middleware/cors');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');
const { sanitizeInput } = require('./middleware/sanitize');
const { logger } = require('./middleware/logger');
const { purchasesRouter } = require('./routes/purchases');
const { billingRouter } = require('./routes/billing');
const { adminRouter } = require('./routes/admin');
const { uploadRouter } = require('./routes/upload');
const { webhookRouter } = require('./routes/webhook');
const { authRouter } = require('./routes/auth');
const { captureException } = require('./lib/monitoring');

process.on('uncaughtException', (err) => {
  captureException(err, { source: 'uncaughtException' });
  console.error('CRITICAL: Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  captureException(error, { source: 'unhandledRejection' });
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

const createApp = () => {
  const app = express();

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://api.dicebear.com", "https://*.supabase.co"],
        connectSrc: ["'self'", "https://*.supabase.co", "https://api.stripe.com", process.env.FRONTEND_URL].filter(Boolean),
        frameSrc: ["'self'", "https://js.stripe.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permissionsPolicy: {
      features: {
        camera: ["'none'"],
        microphone: ["'none'"],
        geolocation: ["'none'"],
      },
    },
  }));

  app.use(logger);
  app.use(corsMiddleware);

  // Health Check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.use('/api', webhookRouter);
  app.use(express.json());
  app.use(sanitizeInput);
  app.use('/api/', apiLimiter);
  app.use('/api/auth', authLimiter);
  app.use('/api', authRouter);
  app.use('/api', purchasesRouter);
  app.use('/api', billingRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api', uploadRouter);

  app.use((err, req, res, next) => {
    captureException(err, {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl
    });
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

module.exports = { createApp };
