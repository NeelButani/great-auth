import type { Request, Response, NextFunction } from 'express'
import pool from '../config/db'
import redisClient from '../config/redis'

export const healthCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check PostgreSQL
    const dbStart = Date.now()
    await pool.query('SELECT 1')
    const dbTime = Date.now() - dbStart

    // Check Redis
    const redisStart = Date.now()
    await redisClient.ping()
    const redisTime = Date.now() - redisStart

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'ok',
          responseTime: `${dbTime}ms`
        },
        redis: {
          status: 'ok',
          responseTime: `${redisTime}ms`
        }
      }
    })
  } catch (err) {
    next(err)
  }
}