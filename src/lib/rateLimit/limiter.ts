import { getSql } from "../history/db";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

// Rate limiting an abuse-prone public endpoint is more important to get right
// than scan history, so this doesn't silently no-op without a DATABASE_URL:
// it falls back to an in-memory fixed window, which is per-instance and resets
// on cold start but still stops a single hammering client in the common case.
const memoryWindows = new Map<string, { count: number; windowStart: number }>();

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  const sql = getSql();
  if (!sql) return Promise.resolve();

  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        window_start TIMESTAMPTZ NOT NULL,
        count INTEGER NOT NULL
      )
    `
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

function checkInMemory(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = memoryWindows.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    memoryWindows.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  const allowed = entry.count <= limit;
  const retryAfterSeconds = Math.ceil((entry.windowStart + windowMs - now) / 1000);
  return { allowed, remaining: Math.max(0, limit - entry.count), retryAfterSeconds: allowed ? 0 : retryAfterSeconds };
}

export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const sql = getSql();
  if (!sql) return checkInMemory(key, limit, windowSeconds);

  try {
    await ensureSchema();
    const rows = await sql`
      INSERT INTO rate_limits (key, window_start, count)
      VALUES (${key}, now(), 1)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < now() - (${windowSeconds}::int * interval '1 second')
          THEN 1 ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < now() - (${windowSeconds}::int * interval '1 second')
          THEN now() ELSE rate_limits.window_start
        END
      RETURNING count, window_start
    `;
    const row = rows[0];
    const count = row.count as number;
    const windowStart = new Date(row.window_start as string).getTime();
    const allowed = count <= limit;
    const retryAfterSeconds = allowed ? 0 : Math.ceil((windowStart + windowSeconds * 1000 - Date.now()) / 1000);
    return { allowed, remaining: Math.max(0, limit - count), retryAfterSeconds };
  } catch {
    // DB hiccup: fail open via the in-memory fallback rather than blocking all scans.
    return checkInMemory(key, limit, windowSeconds);
  }
}
