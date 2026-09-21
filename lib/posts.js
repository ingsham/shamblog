import { query } from "./db";
import { slugify } from "./slugify";

function mapPost(row) {
  if (!row) return null;
  const realLikes = Number(row.like_count) || 0;
  const commentCount = Number(row.comment_count) || 0;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    category: row.category,
    published: row.published,
    likeOverride: row.like_override,
    likeCount: row.like_override !== null ? row.like_override : realLikes,
    realLikeCount: realLikes,
    commentCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const BASE_SELECT = `
  SELECT
    p.*,
    COALESCE(l.like_count, 0) AS like_count,
    COALESCE(c.comment_count, 0) AS comment_count
  FROM posts p
  LEFT JOIN (
    SELECT post_id, COUNT(*)::int AS like_count FROM likes GROUP BY post_id
  ) l ON l.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*)::int AS comment_count FROM comments GROUP BY post_id
  ) c ON c.post_id = p.id
`;

export async function listPosts({ includeDrafts = false, category } = {}) {
  const clauses = [];
  const params = [];
  if (!includeDrafts) {
    clauses.push("p.published = TRUE");
  }
  if (category) {
    params.push(category);
    clauses.push(`p.category = $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const { rows } = await query(
    `${BASE_SELECT} ${where} ORDER BY p.created_at DESC`,
    params
  );
  return rows.map(mapPost);
}

export async function getPostBySlug(slug, { includeDrafts = false } = {}) {
  const clauses = ["p.slug = $1"];
  if (!includeDrafts) clauses.push("p.published = TRUE");
  const { rows } = await query(
    `${BASE_SELECT} WHERE ${clauses.join(" AND ")} LIMIT 1`,
    [slug]
  );
  return mapPost(rows[0]);
}

export async function getPostById(id) {
  const { rows } = await query(`${BASE_SELECT} WHERE p.id = $1 LIMIT 1`, [
    id,
  ]);
  return mapPost(rows[0]);
}

async function uniqueSlug(base) {
  let slug = slugify(base) || "post";
  let attempt = slug;
  let i = 1;
  while (true) {
    const { rows } = await query("SELECT 1 FROM posts WHERE slug = $1", [
      attempt,
    ]);
    if (rows.length === 0) return attempt;
    i += 1;
    attempt = `${slug}-${i}`;
  }
}

export async function createPost({
  title,
  excerpt,
  content,
  coverImage,
  category,
  published,
}) {
  const slug = await uniqueSlug(title);
  const { rows } = await query(
    `INSERT INTO posts (slug, title, excerpt, content, cover_image, category, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      slug,
      title,
      excerpt || "",
      content || "",
      coverImage || null,
      category || "General",
      published !== false,
    ]
  );
  return getPostById(rows[0].id);
}

export async function updatePost(id, fields) {
  const allowed = {
    title: "title",
    excerpt: "excerpt",
    content: "content",
    coverImage: "cover_image",
    category: "category",
    published: "published",
  };
  const sets = [];
  const params = [];
  for (const [key, column] of Object.entries(allowed)) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }
  if (fields.title !== undefined && fields.regenerateSlug) {
    const slug = await uniqueSlug(fields.title);
    params.push(slug);
    sets.push(`slug = $${params.length}`);
  }
  if (sets.length === 0) return getPostById(id);
  sets.push("updated_at = NOW()");
  params.push(id);
  await query(
    `UPDATE posts SET ${sets.join(", ")} WHERE id = $${params.length}`,
    params
  );
  return getPostById(id);
}

export async function setLikeOverride(id, value) {
  await query("UPDATE posts SET like_override = $1 WHERE id = $2", [
    value,
    id,
  ]);
  return getPostById(id);
}

export async function deletePost(id) {
  await query("DELETE FROM posts WHERE id = $1", [id]);
}
