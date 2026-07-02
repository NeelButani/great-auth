import { createClient } from 'redis'
import { env } from './env.js'

const redisClient = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  }
})

redisClient.on('connect', () => {
  console.log('✅ Redis connected')
})

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err.message)
})

// Connect immediately
await redisClient.connect()

export default redisClient