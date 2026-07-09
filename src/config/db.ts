import pg from 'pg'
import type { Pool as PoolType } from 'pg'
import { env } from './env'

const { Pool } = pg

// Create a connection pool with proper typing
const pool: PoolType = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
})

// Test the connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected')
})

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL error:', err.message)
  process.exit(1)
})

// Test connection on startup
pool.query('SELECT 1').catch((err: Error) => {
  console.error('❌ Failed to connect to database during startup:', err.message)
})

export default pool