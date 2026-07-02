-- This table tracks which migration files have already run.
-- Every other table in your database gets created by future migration files.
-- This one is special — it tracks all the others.
CREATE TABLE IF NOT EXISTS migrations (
  id        SERIAL PRIMARY KEY,
  filename  VARCHAR(255) UNIQUE NOT NULL,
  run_at    TIMESTAMP DEFAULT NOW()
);