import { env } from '../config/env.js'

export const errorHandler = (err, req, res, next) => {
  // Log the error internally always
  console.error(err)

  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
    // Only show stack trace in development
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}