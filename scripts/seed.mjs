/**
 * The site seeds itself automatically the first time it creates its tables
 * (see seedIfEmpty in lib/db.js). This script exists for the case where you
 * cleared out every article by hand and want the placeholders back:
 *
 *   DATABASE_URL="postgres://..." npm run seed
 *
 * It does nothing if the site already has any articles.
 */
import pg from 'pg';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error('Set DATABASE_URL first. See .env.example.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false },
});

const run = async () => {
  // ensureSchema() creates the tables if they do not exist yet, and seeds
  // the same placeholder stories the site would add on its own first visit.
  const { ensureSchema } = await import('../lib/db.js');
  await ensureSchema();

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM articles');
  console.log('The site now has ' + rows[0].n + ' article(s).');
};

run()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
  })
  .finally(() => pool.end());
