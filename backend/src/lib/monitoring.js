let currentUser = null;
let sentry = null;

const initSentry = () => {
  if (sentry || !process.env.SENTRY_DSN) {
    return;
  }
  try {
    const Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0
    });
    sentry = Sentry;
  } catch (error) {
    console.warn('Sentry initialization failed:', error.message);
    sentry = null;
  }
};

const setUser = (user) => {
  currentUser = user ? { id: user.id || null } : null;
  initSentry();
  if (sentry && currentUser) {
    sentry.setUser(currentUser);
  }
};

const captureException = (error, context = {}) => {
  const payload = {
    level: 'error',
    message: error && error.message ? error.message : String(error),
    stack: error && error.stack ? error.stack : undefined,
    user: currentUser,
    context
  };
  console.error(payload);
  initSentry();
  if (sentry) {
    sentry.withScope((scope) => {
      if (currentUser) {
        scope.setUser(currentUser);
      }
      Object.entries(context || {}).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      sentry.captureException(error || new Error(payload.message));
    });
  }
};

const captureMessage = (message, context = {}) => {
  const payload = {
    level: 'info',
    message,
    user: currentUser,
    context
  };
  console.log(payload);
  initSentry();
  if (sentry) {
    sentry.withScope((scope) => {
      if (currentUser) {
        scope.setUser(currentUser);
      }
      Object.entries(context || {}).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      sentry.captureMessage(message);
    });
  }
};

module.exports = { captureException, captureMessage, setUser };
