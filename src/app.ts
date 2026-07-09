import type { Request, Response } from 'express'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { env } from './config/env'
import healthRoutes from './routes/health.routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// ─────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────

// 1. Security headers
app.use(helmet())

// 2. CORS
app.use(
  cors({
    origin: env.NODE_ENV === 'development' ? '*' : [],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// 3. Request logging
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

// 4. Parse incoming JSON bodies
app.use(express.json({ limit: '10kb' }))

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

app.use('/api', healthRoutes)

// ─────────────────────────────────────────
// SPECIAL HANDLERS
// ─────────────────────────────────────────

// 404 Handler
app.use((req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.url} not found`,
  })
})

// Global Error Handler
app.use(errorHandler)

export default app