const config = require('../config/env');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';
  let details = err.details || null;

  // Database errors
  if (err.code === '23505') { // Unique violation
    statusCode = 409;
    message = 'Record already exists';
    code = 'DUPLICATE_ENTRY';
    const match = err.detail?.match(/\((.+)\)=\((.+)\)/);
    if (match) {
      details = { field: match[1], value: match[2] };
    }
  } else if (err.code === '23503') { // Foreign key violation
    statusCode = 400;
    message = 'Referenced record does not exist';
    code = 'FOREIGN_KEY_VIOLATION';
  } else if (err.code === '23502') { // Not null violation
    statusCode = 400;
    message = 'Required field is missing';
    code = 'NULL_VIOLATION';
  } else if (err.code === '42P01') { // Table does not exist
    statusCode = 500;
    message = 'Database configuration error';
    code = 'TABLE_NOT_FOUND';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'TOKEN_INVALID';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Don't expose internal errors in production
  if (config.nodeEnv === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = null;
  }

  const errorResponse = {
    success: false,
    error: {
      message,
      code
    }
  };

  if (details && config.nodeEnv !== 'production') {
    errorResponse.error.details = details;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;

