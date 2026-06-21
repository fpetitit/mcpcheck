import { neon } from "@neondatabase/serverless";

// History tracking is optional: the app works fine without a DATABASE_URL,
// it just can't compare a scan against the target's past scans. This lets
// the feature ship before every deployment has Postgres wired up.
export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return neon(connectionString);
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  const sql = getSql();
  if (!sql) return Promise.resolve();

  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS scans (
        id SERIAL PRIMARY KEY,
        target TEXT NOT NULL,
        scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        score INTEGER NOT NULL,
        grade TEXT NOT NULL,
        result JSONB NOT NULL
      )
    `
      .then(() => sql`CREATE INDEX IF NOT EXISTS scans_target_scanned_at_idx ON scans (target, scanned_at DESC)`)
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}
