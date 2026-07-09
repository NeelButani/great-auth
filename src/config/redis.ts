import { createClient } from 'redis'
import type { RedisClientType } from 'redis'
import { env } from './env'

// Create Redis client with proper typing
const redisClient: RedisClientType = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  }
}) as RedisClientType

redisClient.on('connect', () => {
  console.log('✅ Redis connected')
})

redisClient.on('error', (err: Error) => {
  console.error('❌ Redis error:', err.message)
})

// Connect immediately
await redisClient.connect()

export default redisClient