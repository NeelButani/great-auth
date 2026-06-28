import { z } from 'zod'
import dotenv from 'dotenv'

// Load .env file first
dotenv.config()

// Define the shape and types of your environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number),

  // PostgreSQL
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),
})

// Actually validate — if anything is wrong, this throws immediately
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.format())
  process.exit(1)  // Stop the app completely
}

export const env = parsed.data