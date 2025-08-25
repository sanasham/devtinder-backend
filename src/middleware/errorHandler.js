// src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    status = 422;
    const errors = {};
    for (const field in err.errors) errors[field] = err.errors[field].message;
    return res.status(status).json({ message: 'Validation failed', errors });
  }
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  res.status(status).json({ success: false, message });
};
