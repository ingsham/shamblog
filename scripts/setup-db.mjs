// Applies db/schema.sql to the database at process.env.DATABASE_URL.
// Usage: npm run db:setup
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Add it to .env.local (or export it) and try again."
  );
  process.exit(1);
}

const sql = readFileSync(
  path.join(__dirname, "..", "db", "schema.sql"),
  "utf8"
);

const needsSSL =
  /neon\.tech|vercel-storage\.com|supabase\.co|render\.com|amazonaws\.com/.test(
    connectionString
  );

const client = new pg.Client({
  connectionString,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

try {
  await client.connect();
  await client.query(sql);
  console.log("✔ Database schema is up to date.");
} catch (err) {
  console.error("✘ Failed to set up database:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
