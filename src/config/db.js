import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

// Create a connection pool
const pool = new Pool({
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

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err.message)
  process.exit(1)
})

pool.query('SELECT 1').catch((err) => {
  console.error('❌ Failed to connect to database during startup:', err.message)
})

export default pool