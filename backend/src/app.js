const express = require('express');
const { corsMiddleware } = require('./middleware/cors');
const { apiLimiter } = require('./middleware/rateLimit');
const { logger } = require('./middleware/logger');
const { purchasesRouter } = require('./routes/purchases');
const { billingRouter } = require('./routes/billing');
const { adminRouter } = require('./routes/admin');
const { uploadRouter } = require('./routes/upload');
const { webhookRouter } = require('./routes/webhook');
const { captureException } = require('./lib/monitoring');
const path = require('path');

const createApp = () => {
  const app = express();

  app.use(logger);
  app.use(corsMiddleware);
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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
