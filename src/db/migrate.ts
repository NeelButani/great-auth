import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { env } from '../config/env'

dotenv.config()

// In ES modules, __dirname doesn't exist like in CommonJS.
// This is the standard way to get the current directory path
// in ES module files.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Type for migration query result
interface MigrationRow {
  filename: string
}

// Create a direct client (not pool) for migrations.
// We use a single client here because migrations run
// sequentially once — a pool is overkill.
// Use env instead of process.env
const client = new pg.Client({
  host: env.DB_HOST,
  port: env.DB_PORT,        // ← Already a number
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
})

const runMigrations = async (): Promise<void> => {
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
      .filter((f: string) => f.endsWith('.sql'))
      .sort()

    console.log(`📂 Found ${files.length} migration files`)

    // Step 4 — Check which files have already run
    const result = await client.query('SELECT filename FROM migrations')
    const completedMigrations = (result.rows as MigrationRow[]).map(
      (row: MigrationRow) => row.filename
    )

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
        const errorMessage = err instanceof Error ? err.message : String(err)
        throw new Error(`Migration ${file} failed: ${errorMessage}`)
      }
    }

    console.log('🎉 All migrations complete')

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('❌ Migration error:', errorMessage)
    process.exit(1)
  } finally {
    // Always close the connection whether success or failure
    await client.end()
  }
}

runMigrations()