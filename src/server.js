import './config/db.js'
import './config/redis.js'  // Connect redis on startup
import app from './app.js'
import { env } from './config/env.js'

const PORT = env.PORT

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`)
})