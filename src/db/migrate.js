import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

// In ES modules, __dirname doesn't exist like in CommonJS.
// This is the standard way to get the current directory path
// in ES module files.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create a direct client (not pool) for migrations.
// We use a single client here because migrations run
// sequentially once — a pool is overkill.
const client = new pg.Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

const runMigrations = async () => {
  try {
    // Step 1 — Connect to database
    await client.connect()
    console.log('✅ Connected to PostgreSQL')

    // Step 2 — Create migrations table if it doesn't exist yet
    // This is the bootstrapping step.
    // First time ever: this table doesn't exist, so we create it.
    // Every time after: IF NOT EXISTS means this does nothing.
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id        SERIAL PRIMARY KEY,
        filename  VARCHAR(255) UNIQUE NOT NULL,
        run_at    TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Migrations table ready')

    // Step 3 — Read all .sql files from migrations folder
    // Sorted alphabetically — this is why we prefix with 001, 002, 003
    // Alphabetical sort = numerical order
    const migrationsDir = path.join(__dirname, 'migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort()

    console.log(`📂 Found ${files.length} migration files`)

    // Step 4 — Check which files have already run
    const result = await client.query('SELECT filename FROM migrations')
    const completedMigrations = result.rows.map(row => row.filename)

    // Step 5 — Run only the ones that haven't run yet
    for (const file of files) {

      if (completedMigrations.includes(file)) {
        console.log(`⏭️  Skipping ${file} (already ran)`)
        continue
      }

      console.log(`⚡ Running migration: ${file}`)

      // Read the SQL file content
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')

      // Run the SQL and record it — both in one transaction
      // Transaction means: either BOTH succeed or NEITHER does.
      // If the SQL runs but recording fails → next time it runs again → disaster
      // Transaction prevents this. All or nothing.
      await client.query('BEGIN')

      try {
        await client.query(sql)
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [file]
        )
        await client.query('COMMIT')
        console.log(`✅ Completed: ${file}`)
      } catch (err) {
        // Something went wrong — undo everything in this migration
        await client.query('ROLLBACK')
        throw new Error(`Migration ${file} failed: ${err.message}`)
      }
    }

    console.log('🎉 All migrations complete')

  } catch (err) {
    console.error('❌ Migration error:', err.message)
    process.exit(1)
  } finally {
    // Always close the connection whether success or failure
    await client.end()
  }
}

runMigrations()