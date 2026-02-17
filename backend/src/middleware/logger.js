const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const LOGS_DIR = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const ERROR_LOG_PATH = path.join(LOGS_DIR, 'error.log');
const ACCESS_LOG_PATH = path.join(LOGS_DIR, 'access.log');

const createRequestId = () =>
  typeof randomUUID === 'function'
    ? randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatMeta = (meta) =>
  Object.entries(meta)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

const writeToFile = (filePath, content) => {
  try {
    fs.appendFileSync(filePath, content + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
};

const log = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaText = meta ? ` ${formatMeta(meta)}` : '';
  const logLine = `[${timestamp}] ${level.toUpperCase()} ${message}${metaText}`;
  
  // Always log to console
  console.log(logLine);

  // Persist to file
  if (level === 'error' || level === 'warn') {
    writeToFile(ERROR_LOG_PATH, logLine);
  }
  writeToFile(ACCESS_LOG_PATH, logLine);
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
