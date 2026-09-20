import pg from 'pg';

const { Pool } = pg;

function connectionString() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  );
}

// Serverless functions are recycled constantly; cache the pool on globalThis so
// a warm instance reuses its connections instead of opening new ones per request.
const globalForPool = globalThis;

function getPool() {
  const url = connectionString();
  if (!url) {
    throw new Error(
      'No database connection string found. Set DATABASE_URL in your environment (see .env.example).'
    );
  }
  if (!globalForPool.__shamPool) {
    const isLocal = /localhost|127\.0\.0\.1/.test(url);
    globalForPool.__shamPool = new Pool({
      connectionString: url,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    });
  }
  return globalForPool.__shamPool;
}

export async function query(text, params = []) {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result;
}

export async function rows(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

export async function one(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    cover_credit TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'World',
    tags TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT 'SHAM',
    status TEXT NOT NULL DEFAULT 'published',
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    views INTEGER NOT NULL DEFAULT 0,
    like_offset INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT TRUE,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, visitor_id)
  )`,
  `CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    mime TEXT NOT NULL,
    bytes BYTEA NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS articles_published_idx ON articles (status, published_at DESC)`,
  `CREATE INDEX IF NOT EXISTS comments_article_idx ON comments (article_id, created_at DESC)`,
];

export async function ensureSchema() {
  if (!globalForPool.__shamSchema) {
    globalForPool.__shamSchema = (async () => {
      for (const statement of SCHEMA) {
        await query(statement);
      }
    })().catch((err) => {
      globalForPool.__shamSchema = null;
      throw err;
    });
  }
  return globalForPool.__shamSchema;
}

const ARTICLE_FIELDS = `
  a.id, a.slug, a.title, a.subtitle, a.excerpt, a.content, a.cover_image, a.cover_credit,
  a.category, a.tags, a.author, a.status, a.featured, a.views, a.like_offset,
  a.published_at, a.created_at, a.updated_at,
  (a.like_offset + COALESCE((SELECT COUNT(*) FROM likes l WHERE l.article_id = a.id), 0))::int AS likes,
  COALESCE((SELECT COUNT(*) FROM comments c WHERE c.article_id = a.id AND c.approved), 0)::int AS comment_count
`;

export async function listArticles({
  limit = 20,
  offset = 0,
  category = null,
  search = null,
  includeDrafts = false,
  tag = null,
} = {}) {
  await ensureSchema();
  const where = [];
  const params = [];
  if (!includeDrafts) where.push(`a.status = 'published'`);
  if (category) {
    params.push(category);
    where.push(`a.category = $${params.length}`);
  }
  if (tag) {
    params.push('%' + tag + '%');
    where.push(`a.tags ILIKE $${params.length}`);
  }
  if (search) {
    params.push('%' + search + '%');
    const p = '$' + params.length;
    where.push(`(a.title ILIKE ${p} OR a.excerpt ILIKE ${p} OR a.content ILIKE ${p} OR a.tags ILIKE ${p})`);
  }
  params.push(limit, offset);
  const sql = `
    SELECT ${ARTICLE_FIELDS}
    FROM articles a
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY a.featured DESC, a.published_at DESC
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;
  return rows(sql, params);
}

export async function countArticles({ category = null, search = null, includeDrafts = false } = {}) {
  await ensureSchema();
  const where = [];
  const params = [];
  if (!includeDrafts) where.push(`status = 'published'`);
  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  if (search) {
    params.push('%' + search + '%');
    const p = '$' + params.length;
    where.push(`(title ILIKE ${p} OR excerpt ILIKE ${p} OR content ILIKE ${p} OR tags ILIKE ${p})`);
  }
  const result = await one(
    `SELECT COUNT(*)::int AS n FROM articles ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`,
    params
  );
  return result ? result.n : 0;
}

export async function getArticleBySlug(slug, { includeDrafts = false } = {}) {
  await ensureSchema();
  return one(
    `SELECT ${ARTICLE_FIELDS} FROM articles a WHERE a.slug = $1 ${
      includeDrafts ? '' : `AND a.status = 'published'`
    } LIMIT 1`,
    [slug]
  );
}

export async function getArticleById(id) {
  await ensureSchema();
  return one(`SELECT ${ARTICLE_FIELDS} FROM articles a WHERE a.id = $1 LIMIT 1`, [id]);
}

export async function getRelated(article, limit = 3) {
  await ensureSchema();
  return rows(
    `SELECT ${ARTICLE_FIELDS}
     FROM articles a
     WHERE a.status = 'published' AND a.id <> $1
     ORDER BY (a.category = $2) DESC, a.published_at DESC
     LIMIT $3`,
    [article.id, article.category, limit]
  );
}

export async function getComments(articleId, { includeHidden = false } = {}) {
  await ensureSchema();
  return rows(
    `SELECT * FROM comments
     WHERE article_id = $1 ${includeHidden ? '' : 'AND approved'}
     ORDER BY pinned DESC, created_at DESC`,
    [articleId]
  );
}

export async function categoryCounts() {
  await ensureSchema();
  return rows(
    `SELECT category, COUNT(*)::int AS n FROM articles WHERE status = 'published' GROUP BY category ORDER BY n DESC`
  );
}

/**
 * Wraps a query so a missing or unreachable database renders a setup message
 * instead of a crash. Returns `fallback` and logs the reason.
 */
export async function tryDb(factory, fallback = null) {
  try {
    return await factory();
  } catch (err) {
    console.error('[sham] database unavailable:', err.message);
    return fallback;
  }
}

export async function mostRead(limit = 5) {
  await ensureSchema();
  return rows(
    `SELECT id, slug, title, category, views FROM articles
     WHERE status = 'published'
     ORDER BY views DESC, published_at DESC
     LIMIT $1`,
    [limit]
  );
}

export async function adminStats() {
  await ensureSchema();
  return one(`
    SELECT
      (SELECT COUNT(*)::int FROM articles) AS articles,
      (SELECT COUNT(*)::int FROM articles WHERE status = 'published') AS published,
      (SELECT COUNT(*)::int FROM comments) AS comments,
      (SELECT COALESCE(SUM(views), 0)::int FROM articles) AS views,
      (SELECT COUNT(*)::int FROM likes) AS likes,
      (SELECT COALESCE(SUM(like_offset), 0)::int FROM articles) AS like_offset,
      (SELECT COUNT(*)::int FROM subscribers) AS subscribers
  `);
}
