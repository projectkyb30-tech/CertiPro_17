/**
 * Standard API Response Wrapper
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details
  });
};

module.exports = {
  sendSuccess,
  sendError
};
