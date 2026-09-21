import pg from "pg";

const connectionString = process.env.DATABASE_URL;

const needsSSL =
  connectionString &&
  /neon\.tech|vercel-storage\.com|supabase\.co|render\.com|amazonaws\.com/.test(
    connectionString
  );

// Reuse the pool across hot reloads / serverless invocations.
const globalForPg = globalThis;

function createPool() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your environment (see .env.example)."
    );
  }
  return new pg.Pool({
    connectionString,
    ssl: needsSSL ? { rejectUnauthorized: false } : false,
    max: 5,
  });
}

export function getPool() {
  if (!globalForPg._shamPgPool) {
    globalForPg._shamPgPool = createPool();
  }
  return globalForPg._shamPgPool;
}

export async function query(text, params) {
  const pool = getPool();
  return pool.query(text, params);
}
