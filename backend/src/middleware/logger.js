const { randomUUID } = require('crypto');

const createRequestId = () =>
  typeof randomUUID === 'function'
    ? randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatMeta = (meta) =>
  Object.entries(meta)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

const log = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaText = meta ? ` ${formatMeta(meta)}` : '';
  console.log(`[${timestamp}] ${level.toUpperCase()} ${message}${metaText}`);
};

const logger = (req, res, next) => {
  const requestId = createRequestId();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  const start = process.hrtime.bigint();

  log('info', 'request.start', {
    requestId,
    method: req.method,
    url: req.originalUrl
  });

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    log(level, 'request.finish', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: durationMs.toFixed(1)
    });
  });

  next();
};

module.exports = { logger };
