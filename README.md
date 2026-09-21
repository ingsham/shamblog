# SHAM

A modern news & blog platform: an admin dashboard for writing and publishing
articles (with drag-and-drop image uploads), and a public site where anyone
can read, like and comment without creating an account.

Built with Next.js 16 (App Router), Tailwind CSS, and Postgres. No Prisma,
no heavyweight CMS — just a small, readable codebase you can extend.

## Features

- **Public site** — magazine-style homepage, individual article pages,
  Markdown article content, social share buttons (X, Facebook, LinkedIn,
  WhatsApp, Telegram, copy link)
- **Likes & comments, no login required** — visitors are tracked by an
  anonymous cookie so they can't like the same post twice, but never need an
  account
- **Admin dashboard** (`/admin`) — protected by a single admin login
  - Write posts in Markdown with a live preview
  - Drag-and-drop (or click to browse) image upload from your desktop,
    stored on Vercel Blob
  - Publish / unpublish / delete posts
  - Edit or delete any comment
  - Manually edit or reset a post's like count
- Modern, distinctive editorial design (self-hosted Fraunces + Inter fonts —
  no external font requests at runtime)

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values, see below
npm run db:setup             # creates the posts/likes/comments tables
npm run dev
```

Open http://localhost:3000. Sign in at `/admin/login` with the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env.local`.

You'll need a Postgres database even for local development — see the
options below. Image uploads only work once `BLOB_READ_WRITE_TOKEN` is set
(see step 3); everything else works without it.

## 2. Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `ADMIN_EMAIL` | The email you'll log in with |
| `ADMIN_PASSWORD` | The password you'll log in with |
| `JWT_SECRET` | A long random string used to sign admin session cookies |
| `BLOB_READ_WRITE_TOKEN` | Auto-created when you enable Vercel Blob (step 3) |
| `NEXT_PUBLIC_SITE_NAME` | Defaults to `SHAM` |
| `NEXT_PUBLIC_SITE_URL` | Your site's public URL (used for share links and SEO tags) |

Generate a `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Deploying to Vercel

### a) Push this project to a Git repo

Create a new repo on GitHub (or GitLab/Bitbucket) and push this folder to
it, then import it at https://vercel.com/new.

### b) Add a Postgres database

Any Postgres works. The easiest options that integrate directly with
Vercel:

- **Vercel Postgres / Neon** — in your Vercel project, go to
  **Storage → Create Database → Postgres**. Vercel adds `DATABASE_URL` to
  your project automatically.
- **Supabase / Railway / your own Postgres** — create a database there and
  copy its connection string into the `DATABASE_URL` environment variable
  on your Vercel project (**Settings → Environment Variables**).

Either way, once you have a connection string, run the schema against it
once from your machine:

```bash
DATABASE_URL="your-connection-string" npm run db:setup
```

### c) Enable image uploads (Vercel Blob)

In your Vercel project: **Storage → Create Database → Blob**. This
automatically adds `BLOB_READ_WRITE_TOKEN` to your project's environment
variables — you don't need to copy anything by hand. Without this step,
everything else works, but image uploads in the admin dashboard will show
a friendly error until it's enabled.

### d) Set the remaining environment variables

In **Vercel → Settings → Environment Variables**, add:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_NAME` (optional, defaults to `SHAM`)
- `NEXT_PUBLIC_SITE_URL` — set this to your real deployed URL (e.g.
  `https://sham.vercel.app`) once you know it; it's used for social share
  links and SEO tags

### e) Deploy

Click **Deploy**. Once it's live, visit `/admin/login`, sign in, and
publish your first article.

## Project structure

```
app/
  page.js                     Homepage (featured post + grid)
  post/[slug]/page.js         Public article page
  admin/login/page.js         Admin sign-in
  admin/(dashboard)/          Admin dashboard, protected route group
  api/posts/...               Public API: list, single post, like, comments
  api/admin/...               Admin-only API: posts CRUD, comments, upload
components/                   UI components (cards, like button, share, etc.)
lib/                          Database access, auth, formatting helpers
db/schema.sql                 Postgres schema
scripts/setup-db.mjs          Applies schema.sql to $DATABASE_URL
proxy.js                      Route protection for /admin and /api/admin
```

## Notes

- Comments and likes require no account — anonymous visitors are tracked
  by a long-lived, unguessable cookie, purely to prevent double-liking and
  attribute comments to a name they type in.
- The admin area is protected both by `proxy.js` (Next.js's routing layer)
  and a second check inside each admin API route, so there's no single
  point of failure for auth.
- Article content is Markdown, rendered with `react-markdown` +
  `remark-gfm` (so tables, task lists, etc. all work).
