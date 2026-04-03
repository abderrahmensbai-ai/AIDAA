// ============================================================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// ============================================================================
// Catches all errors and returns standardized error response
// Must be the last middleware mounted in app.js

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
};

module.exports = errorHandler;
