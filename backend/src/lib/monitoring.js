let currentUser = null;

const setUser = (user) => {
  currentUser = user ? { id: user.id || null } : null;
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
};

const captureMessage = (message, context = {}) => {
  const payload = {
    level: 'info',
    message,
    user: currentUser,
    context
  };
  console.log(payload);
};

module.exports = { captureException, captureMessage, setUser };
