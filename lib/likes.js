import { query } from "./db";

export async function hasLiked(postId, visitorId) {
  const { rows } = await query(
    "SELECT 1 FROM likes WHERE post_id = $1 AND visitor_id = $2",
    [postId, visitorId]
  );
  return rows.length > 0;
}

export async function addLike(postId, visitorId) {
  await query(
    `INSERT INTO likes (post_id, visitor_id) VALUES ($1, $2)
     ON CONFLICT (post_id, visitor_id) DO NOTHING`,
    [postId, visitorId]
  );
}

export async function removeLike(postId, visitorId) {
  await query("DELETE FROM likes WHERE post_id = $1 AND visitor_id = $2", [
    postId,
    visitorId,
  ]);
}

export async function clearLikes(postId) {
  await query("DELETE FROM likes WHERE post_id = $1", [postId]);
}
