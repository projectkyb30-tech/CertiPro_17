const express = require('express');
const helmet = require('helmet');
const { corsMiddleware } = require('./middleware/cors');
const { apiLimiter } = require('./middleware/rateLimit');
const { logger } = require('./middleware/logger');
const { purchasesRouter } = require('./routes/purchases');
const { billingRouter } = require('./routes/billing');
const { adminRouter } = require('./routes/admin');
const { uploadRouter } = require('./routes/upload');
const { webhookRouter } = require('./routes/webhook');
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
    contentSecurityPolicy: false, // Handled by frontend or specifically configured if needed
  }));

  app.use(logger);
  app.use(corsMiddleware);
  
  // Health Check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  app.use('/api', webhookRouter);
  app.use(express.json());
  app.use('/api/', apiLimiter);
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
