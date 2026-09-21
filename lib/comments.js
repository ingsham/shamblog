import { query } from "./db";

function mapComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    name: row.name,
    body: row.body,
    approved: row.approved,
    createdAt: row.created_at,
  };
}

export async function listCommentsForPost(postId, { onlyApproved = true } = {}) {
  const clauses = ["post_id = $1"];
  if (onlyApproved) clauses.push("approved = TRUE");
  const { rows } = await query(
    `SELECT * FROM comments WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`,
    [postId]
  );
  return rows.map(mapComment);
}

export async function listAllComments() {
  const { rows } = await query(
    `SELECT c.*, p.title AS post_title, p.slug AS post_slug
     FROM comments c JOIN posts p ON p.id = c.post_id
     ORDER BY c.created_at DESC`
  );
  return rows.map((row) => ({
    ...mapComment(row),
    postTitle: row.post_title,
    postSlug: row.post_slug,
  }));
}

export async function createComment(postId, { name, body }) {
  const { rows } = await query(
    `INSERT INTO comments (post_id, name, body) VALUES ($1, $2, $3) RETURNING *`,
    [postId, name, body]
  );
  return mapComment(rows[0]);
}

export async function updateComment(id, fields) {
  const sets = [];
  const params = [];
  if (fields.body !== undefined) {
    params.push(fields.body);
    sets.push(`body = $${params.length}`);
  }
  if (fields.approved !== undefined) {
    params.push(fields.approved);
    sets.push(`approved = $${params.length}`);
  }
  if (sets.length === 0) return;
  params.push(id);
  const { rows } = await query(
    `UPDATE comments SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return mapComment(rows[0]);
}

export async function deleteComment(id) {
  await query("DELETE FROM comments WHERE id = $1", [id]);
}
