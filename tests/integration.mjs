/**
 * Exercises the real API route handlers end to end against a live SQL database.
 * Covers the paths a reader and an editor actually take: signing in, writing,
 * publishing, uploading a picture, commenting without an account, liking,
 * moderating, overriding counts and deleting.
 *
 * Run with:  npm test
 */
import './support/register.mjs';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = 'postgres://test/test';
process.env.ADMIN_PASSWORD = 'correct-horse-battery';
process.env.ADMIN_SECRET = 'test-secret';

const { jar } = await import('./support/next-headers.mjs');
const articlesRoute = await import('../app/api/articles/route.js');
const articleRoute = await import('../app/api/articles/[id]/route.js');
const loginRoute = await import('../app/api/auth/login/route.js');
const logoutRoute = await import('../app/api/auth/logout/route.js');
const commentsRoute = await import('../app/api/comments/route.js');
const commentRoute = await import('../app/api/comments/[id]/route.js');
const likesRoute = await import('../app/api/likes/route.js');
const viewsRoute = await import('../app/api/views/route.js');
const uploadRoute = await import('../app/api/upload/route.js');
const imagesRoute = await import('../app/api/images/[id]/route.js');
const subscribeRoute = await import('../app/api/subscribe/route.js');
const db = await import('../lib/db.js');

let passed = 0;
let failed = 0;
const failures = [];

async function test(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log('  ok   ' + name);
  } catch (err) {
    failed += 1;
    failures.push(name);
    console.log('  FAIL ' + name + '\n       ' + (err.stack || err.message).split('\n').slice(0, 3).join('\n       '));
  }
}

let ipCounter = 0;
function post(url, body, headers = {}) {
  ipCounter += 1;
  return new Request('http://localhost' + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.' + ipCounter, ...headers },
    body: JSON.stringify(body),
  });
}

function get(url) {
  return new Request('http://localhost' + url);
}

function params(values) {
  return { params: Promise.resolve(values) };
}

async function signIn() {
  const res = await loginRoute.POST(post('/api/auth/login', { password: 'correct-horse-battery' }));
  assert.equal(res.status, 200);
}

function signOut() {
  jar.clear();
}

console.log('\nadmin access');

await test('the article list is closed to visitors', async () => {
  signOut();
  const res = await articlesRoute.GET(get('/api/articles'));
  assert.equal(res.status, 401);
});

await test('a wrong password is refused', async () => {
  const res = await loginRoute.POST(post('/api/auth/login', { password: 'guess' }));
  assert.equal(res.status, 401);
  assert.equal(jar.size, 0);
});

await test('the right password opens a session', async () => {
  await signIn();
  const res = await articlesRoute.GET(get('/api/articles'));
  assert.equal(res.status, 200);
});

await test('signing out closes it again', async () => {
  await logoutRoute.POST();
  const res = await articlesRoute.GET(get('/api/articles'));
  assert.equal(res.status, 401);
  await signIn();
});

console.log('\nwriting and publishing');

let articleId = null;
let articleSlug = null;

await test('a story can be published', async () => {
  const res = await articlesRoute.POST(
    post('/api/articles', {
      title: 'Accra opens its new rail link',
      content: 'The first service left at dawn.\n\n## What changes\n\nCommuters save an hour.',
      category: 'Business',
      tags: 'accra, transport',
      author: 'Ama Boateng',
    })
  );
  assert.equal(res.status, 200);
  const { article } = await res.json();
  articleId = article.id;
  articleSlug = article.slug;
  assert.equal(article.slug, 'accra-opens-its-new-rail-link');
  assert.equal(article.status, 'published');
  assert.equal(article.category, 'Business');
  assert.match(article.excerpt, /first service/);
});

await test('a second story with the same headline gets its own address', async () => {
  const res = await articlesRoute.POST(
    post('/api/articles', { title: 'Accra opens its new rail link', content: 'A follow-up.' })
  );
  const { article } = await res.json();
  assert.equal(article.slug, 'accra-opens-its-new-rail-link-2');
});

await test('a story without a headline is refused', async () => {
  const res = await articlesRoute.POST(post('/api/articles', { content: 'Body only.' }));
  assert.equal(res.status, 400);
});

await test('visitors cannot publish', async () => {
  signOut();
  const res = await articlesRoute.POST(post('/api/articles', { title: 'Fake', content: 'Fake' }));
  assert.equal(res.status, 401);
  await signIn();
});

await test('the published story is readable on the site', async () => {
  const article = await db.getArticleBySlug(articleSlug);
  assert.ok(article);
  assert.equal(article.title, 'Accra opens its new rail link');
  assert.equal(article.likes, 0);
  assert.equal(article.comment_count, 0);
});

await test('a draft stays off the site but stays in the newsroom', async () => {
  const created = await articlesRoute.POST(
    post('/api/articles', { title: 'Unfinished piece', content: 'Notes.', status: 'draft' })
  );
  const { article } = await created.json();
  assert.equal(await db.getArticleBySlug(article.slug), null);
  assert.ok(await db.getArticleBySlug(article.slug, { includeDrafts: true }));
  const listed = await db.listArticles({ includeDrafts: true, limit: 50 });
  assert.ok(listed.some((a) => a.id === article.id));
  const publicList = await db.listArticles({ limit: 50 });
  assert.ok(!publicList.some((a) => a.id === article.id));
});

await test('an edit saves and the address follows the new headline', async () => {
  const res = await articleRoute.PATCH(
    post('/api/articles/' + articleId, {
      title: 'Accra opens its new rail link to Tema',
      slug: 'accra-opens-its-new-rail-link-to-tema',
      featured: true,
    }),
    params({ id: String(articleId) })
  );
  assert.equal(res.status, 200);
  const { article } = await res.json();
  assert.equal(article.slug, 'accra-opens-its-new-rail-link-to-tema');
  assert.equal(Boolean(article.featured), true);
  articleSlug = article.slug;
});

await test('search finds the story by word and by tag', async () => {
  const byWord = await db.listArticles({ search: 'commuters', limit: 10 });
  assert.ok(byWord.some((a) => a.id === articleId));
  const byTag = await db.listArticles({ tag: 'transport', limit: 10 });
  assert.ok(byTag.some((a) => a.id === articleId));
});

console.log('\npictures from the desktop');

let imageUrl = null;

await test('only an editor can upload', async () => {
  signOut();
  const form = new FormData();
  form.append('file', new File([new Uint8Array([1, 2, 3])], 'p.png', { type: 'image/png' }));
  const res = await uploadRoute.POST(
    new Request('http://localhost/api/upload', { method: 'POST', body: form })
  );
  assert.equal(res.status, 401);
  await signIn();
});

await test('a picture uploads and comes back with a usable address', async () => {
  const form = new FormData();
  form.append('file', new File([new Uint8Array([137, 80, 78, 71])], 'lead.png', { type: 'image/png' }));
  const res = await uploadRoute.POST(
    new Request('http://localhost/api/upload', { method: 'POST', body: form })
  );
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.match(data.url, /^\/api\/images\/[a-f0-9]+\.png$/);
  imageUrl = data.url;
});

await test('a non-image file is turned away', async () => {
  const form = new FormData();
  form.append('file', new File(['hello'], 'notes.txt', { type: 'text/plain' }));
  const res = await uploadRoute.POST(
    new Request('http://localhost/api/upload', { method: 'POST', body: form })
  );
  assert.equal(res.status, 400);
});

await test('the uploaded picture is served back to readers', async () => {
  const id = imageUrl.split('/').pop();
  const res = await imagesRoute.GET(get(imageUrl), params({ id }));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'image/png');
});

await test('a missing picture is a clean 404', async () => {
  const res = await imagesRoute.GET(get('/api/images/nope.png'), params({ id: 'nope.png' }));
  assert.equal(res.status, 404);
});

console.log('\nreaders: comments without an account');

let commentId = null;

await test('anyone signed out can comment', async () => {
  signOut();
  const res = await commentsRoute.POST(
    post('/api/comments', { articleId, name: 'Kwesi', body: 'Took this train today. Smooth.' })
  );
  assert.equal(res.status, 200);
  const { comment } = await res.json();
  commentId = comment.id;
  assert.equal(comment.name, 'Kwesi');
  assert.ok(comment.approved);
});

await test('an empty comment is refused', async () => {
  const res = await commentsRoute.POST(post('/api/comments', { articleId, body: ' ' }));
  assert.equal(res.status, 400);
});

await test('a comment on a story that does not exist is refused', async () => {
  const res = await commentsRoute.POST(post('/api/comments', { articleId: 999999, body: 'Hello there' }));
  assert.equal(res.status, 404);
});

await test('a nameless comment is credited to Reader', async () => {
  const res = await commentsRoute.POST(post('/api/comments', { articleId, body: 'Good news for Tema.' }));
  const { comment } = await res.json();
  assert.equal(comment.name, 'Reader');
});

await test('rapid repeat posting from one address is slowed down', async () => {
  const first = await commentsRoute.POST(
    post('/api/comments', { articleId, body: 'First thought' }, { 'x-forwarded-for': '203.0.113.9' })
  );
  assert.equal(first.status, 200);
  const second = await commentsRoute.POST(
    post('/api/comments', { articleId, body: 'Second thought' }, { 'x-forwarded-for': '203.0.113.9' })
  );
  assert.equal(second.status, 429);
});

await test('a bot filling the hidden field is quietly dropped', async () => {
  const before = (await db.getComments(articleId)).length;
  const res = await commentsRoute.POST(
    post('/api/comments', { articleId, body: 'Buy cheap things', website: 'http://spam.example' })
  );
  assert.equal(res.status, 200);
  assert.equal((await db.getComments(articleId)).length, before);
});

await test('the comment count on the story keeps up', async () => {
  const article = await db.getArticleBySlug(articleSlug);
  assert.equal(article.comment_count, (await db.getComments(articleId)).length);
});

console.log('\nreaders: likes without an account');

await test('a like registers and can be taken back', async () => {
  signOut();
  const on = await likesRoute.POST(post('/api/likes', { articleId }));
  const first = await on.json();
  assert.equal(first.likes, 1);
  assert.equal(first.liked, true);

  const off = await likesRoute.POST(post('/api/likes', { articleId }));
  const second = await off.json();
  assert.equal(second.likes, 0);
  assert.equal(second.liked, false);
});

await test('the same reader cannot like twice', async () => {
  await likesRoute.POST(post('/api/likes', { articleId }));
  await likesRoute.POST(post('/api/likes', { articleId }));
  await likesRoute.POST(post('/api/likes', { articleId }));
  const res = await likesRoute.GET(get('/api/likes?articleId=' + articleId));
  const data = await res.json();
  assert.equal(data.likes, 1);
  assert.equal(data.liked, true);
});

await test('a different reader adds a second like', async () => {
  jar.set('sham_visitor', 'another-visitor-id');
  const res = await likesRoute.POST(post('/api/likes', { articleId }));
  const data = await res.json();
  assert.equal(data.likes, 2);
});

await test('views count up', async () => {
  const before = (await db.getArticleById(articleId)).views;
  await viewsRoute.POST(post('/api/views', { articleId }));
  await viewsRoute.POST(post('/api/views', { articleId }));
  assert.equal((await db.getArticleById(articleId)).views, before + 2);
});

console.log('\nmoderation and manual counts');

await test('an editor can rewrite a comment', async () => {
  await signIn();
  const res = await commentRoute.PATCH(
    post('/api/comments/' + commentId, { body: 'Took this train today — smooth ride.' }),
    params({ id: String(commentId) })
  );
  assert.equal(res.status, 200);
  const { comment } = await res.json();
  assert.match(comment.body, /smooth ride/);
});

await test('a hidden comment disappears from the story but stays in the newsroom', async () => {
  await commentRoute.PATCH(
    post('/api/comments/' + commentId, { approved: false }),
    params({ id: String(commentId) })
  );
  const onSite = await db.getComments(articleId);
  assert.ok(!onSite.some((c) => c.id === commentId));
  const inNewsroom = await db.getComments(articleId, { includeHidden: true });
  assert.ok(inNewsroom.some((c) => c.id === commentId));
});

await test('a pinned comment rises to the top', async () => {
  await commentRoute.PATCH(
    post('/api/comments/' + commentId, { approved: true, pinned: true }),
    params({ id: String(commentId) })
  );
  const list = await db.getComments(articleId);
  assert.equal(list[0].id, commentId);
});

await test('visitors cannot moderate', async () => {
  signOut();
  const patch = await commentRoute.PATCH(
    post('/api/comments/' + commentId, { body: 'hacked' }),
    params({ id: String(commentId) })
  );
  assert.equal(patch.status, 401);
  const del = await commentRoute.DELETE(get('/x'), params({ id: String(commentId) }));
  assert.equal(del.status, 401);
  await signIn();
});

await test('an editor can delete a comment', async () => {
  const res = await commentRoute.DELETE(get('/x'), params({ id: String(commentId) }));
  assert.equal(res.status, 200);
  const list = await db.getComments(articleId, { includeHidden: true });
  assert.ok(!list.some((c) => c.id === commentId));
});

await test('an editor can set the like total by hand', async () => {
  const res = await articleRoute.PATCH(
    post('/api/articles/' + articleId, { likes: 500 }),
    params({ id: String(articleId) })
  );
  const { article } = await res.json();
  assert.equal(article.likes, 500);
});

await test('reader likes keep counting on top of the set total', async () => {
  signOut();
  jar.set('sham_visitor', 'third-visitor-id');
  const res = await likesRoute.POST(post('/api/likes', { articleId }));
  const data = await res.json();
  assert.equal(data.likes, 501);
  await signIn();
});

await test('an editor can set the view total by hand', async () => {
  const res = await articleRoute.PATCH(
    post('/api/articles/' + articleId, { views: 12000 }),
    params({ id: String(articleId) })
  );
  const { article } = await res.json();
  assert.equal(article.views, 12000);
});

console.log('\nnewsletter and clean-up');

await test('a good email is stored once', async () => {
  const first = await subscribeRoute.POST(post('/api/subscribe', { email: 'Reader@Example.com' }));
  assert.equal(first.status, 200);
  const again = await subscribeRoute.POST(post('/api/subscribe', { email: 'reader@example.com' }));
  assert.equal(again.status, 200);
  const count = await db.one('SELECT COUNT(*) AS n FROM subscribers');
  assert.equal(Number(count.n), 1);
});

await test('a bad email is refused', async () => {
  const res = await subscribeRoute.POST(post('/api/subscribe', { email: 'not-an-email' }));
  assert.equal(res.status, 400);
});

await test('deleting a story takes its comments and likes with it', async () => {
  await commentsRoute.POST(post('/api/comments', { articleId, body: 'One last word' }));
  const res = await articleRoute.DELETE(get('/x'), params({ id: String(articleId) }));
  assert.equal(res.status, 200);
  assert.equal(await db.getArticleById(articleId), null);
  const orphanComments = await db.one('SELECT COUNT(*) AS n FROM comments WHERE article_id = $1', [articleId]);
  const orphanLikes = await db.one('SELECT COUNT(*) AS n FROM likes WHERE article_id = $1', [articleId]);
  assert.equal(Number(orphanComments.n), 0);
  assert.equal(Number(orphanLikes.n), 0);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
if (failed > 0) {
  console.log('failing: ' + failures.join(', ') + '\n');
  process.exit(1);
}
