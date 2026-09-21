-- SHAM blog database schema
-- Run this once against your Postgres database before first deploy.
-- (Locally: npm run db:setup   |   Any DB: psql "$DATABASE_URL" -f db/schema.sql)

CREATE TABLE IF NOT EXISTS posts (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL DEFAULT '',
  content       TEXT NOT NULL DEFAULT '',
  cover_image   TEXT,
  category      TEXT NOT NULL DEFAULT 'General',
  published     BOOLEAN NOT NULL DEFAULT TRUE,
  like_override INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id          SERIAL PRIMARY KEY,
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  visitor_id  TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id          SERIAL PRIMARY KEY,
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  body        TEXT NOT NULL,
  approved    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, created_at DESC);
