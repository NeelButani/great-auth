import './config/db'
import './config/redis' // Connect redis on startup
import app from './app'
import { env } from './config/env'

const PORT = env.PORT

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`)
})