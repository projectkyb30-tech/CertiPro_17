type MonitoringContext = Record<string, unknown>;

let currentUser: { id?: string | null } | null = null;

export const setUser = (user: { id?: string | null } | null) => {
  currentUser = user ? { id: user.id ?? null } : null;
};

export const captureError = (error: unknown, context: MonitoringContext = {}) => {
  const payload = {
    level: 'error',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    user: currentUser,
    context
  };
  console.error(payload);
};

export const captureMessage = (message: string, context: MonitoringContext = {}) => {
  const payload = {
    level: 'info',
    message,
    user: currentUser,
    context
  };
  console.log(payload);
};
