import type { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

// Define a custom error type that can have statusCode
interface CustomError extends Error {
  statusCode?: number
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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