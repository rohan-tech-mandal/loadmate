/**
 * Custom error handler middleware
 * Formats error responses and handles different error types
 */
const errorHandler = (err, req, res, next) => {
  // Set status code (use existing status code or default to 500)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Send JSON response with error details
  res.json({
    message: err.message,
    // Include stack trace only in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export { errorHandler, notFound };