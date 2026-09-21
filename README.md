# SHAM

A news and blog site: front page, sections, search, an admin newsroom behind a
password, image uploads straight from your computer, likes and comments that
need no reader account, and sharing to the usual social networks.

Built with Next.js 15 (App Router) and Postgres. Nothing else to sign up for.

---

## Put it online in about ten minutes

### 1. Push this to GitHub

```bash
cd sham
git init
git add .
git commit -m "SHAM"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/sham.git
git push -u origin main
```

### 2. Import it into Vercel

Go to vercel.com → **Add New… → Project** → pick the `sham` repository →
**Import**. Leave every build setting alone; Vercel detects Next.js. Click
**Deploy**. The first deploy will succeed and show a "needs a database" notice —
that's expected.

### 3. Add the database

In your new Vercel project: **Storage → Create Database → Neon (Postgres) →
Create**, then connect it to the project. Vercel sets `DATABASE_URL` for you.

Any Postgres works — Neon, Supabase, Railway, your own server. If you use one
of those, copy its connection string into an environment variable named
`DATABASE_URL` yourself.

### 4. Set your password

**Settings → Environment Variables**, add these two to every environment
(Production, Preview, Development):

| Name | Value |
| --- | --- |
| `ADMIN_PASSWORD` | the password you will type to sign in |
| `ADMIN_SECRET` | any long random string — run `openssl rand -base64 32` |

### 5. Redeploy

**Deployments → the top one → ⋯ → Redeploy.** Open the site. The tables are
created on the first request, so there is no migration step. That first
request also fills the front page with a set of placeholder stories (see
"Placeholder content" below), so it never opens to a blank page.

### 6. Write

Go to `https://your-site.vercel.app/admin`, sign in, and start replacing the
placeholder stories with your own — edit one, or delete it and write a new
one from **Write a story**.

If the admin dashboard says the database is not reachable, it now shows the
exact connection error under that message, plus a numbered checklist —
that's the fastest way to tell whether it's a missing environment variable, a
variable set on the wrong environment, or a deploy that ran before the
variable was added.

---

## Running it on your own machine

```bash
npm install
cp .env.example .env.local     # fill in DATABASE_URL, ADMIN_PASSWORD, ADMIN_SECRET
npm run dev                    # http://localhost:3000
npm test                       # 64 checks: logic, API behaviour, structure
```

---

## Placeholder content

The first time the site creates its database tables, it also inserts about a
dozen placeholder stories — one per section, plus a few short posts about the
site itself — so the front page looks the way a finished site should from the
very first visit instead of showing an empty state. Every placeholder news
story says **"Placeholder story"** right in its preview text, so there is no
chance of mistaking one for real reporting, and each has a stock cover photo
from a free placeholder image service.

Edit or delete any of them from the newsroom like any other story. If you
clear out every article by hand and want them back, run `npm run seed` with
`DATABASE_URL` set — it does nothing if the site already has any stories.

---

## What is in the box

**For readers**

- Front page with a lead story, a section of highlights and a numbered river of
  the rest, plus a most-read list
- Eight sections, each with its own colour running through the kicker, links,
  reading progress bar and like button
- Search across headlines, standfirsts, tags and full text
- Light and dark themes, following the device and remembered per visitor
- Reading progress bar, reading time, view counts
- Likes and comments with no sign-up, kept per device by cookie
- Share to X, Facebook, WhatsApp, LinkedIn, Telegram, Reddit and email, plus
  copy link and the phone's native share sheet
- Friday email sign-up
- Preview cards when a link is pasted into a chat or timeline, `sitemap.xml`,
  `rss.xml`, `robots.txt` and article structured data

**For you**

- `/admin` behind a password, with a signed, httpOnly session cookie
- Markdown editor with a formatting toolbar and a live preview
- Lead picture by click or drag-and-drop from your desktop; pictures inside the
  body with one button. Large photos are shrunk in your browser before upload
- Drafts, publishing, unpublishing, and pinning a story to the top
- Per-story section, byline, tags, web address and picture credit
- Likes and views editable by hand — reader likes keep counting on top
- Comment moderation: edit the text or the name, pin, hide or delete
- Subscriber list ready to copy

---

## How things are stored

| Table | Holds |
| --- | --- |
| `articles` | every story, draft or published |
| `comments` | reader comments, with pinned and hidden flags |
| `likes` | one row per device per story |
| `images` | uploaded pictures, served from `/api/images/…` and cached forever |
| `subscribers` | email sign-ups |

Pictures live in the database rather than a separate file service, so there is
one thing to set up instead of two. They are resized to 1800px wide in the
browser before upload and capped at 4 MB. If you start publishing very
image-heavy galleries, move them to Vercel Blob or S3 and store the URL in
`cover_image` instead — the rest of the site does not change.

## Making it yours

| What | Where |
| --- | --- |
| Section names and colours | `lib/utils.js` |
| Colours, type and spacing | the tokens at the top of `app/globals.css` |
| Site name and description | `app/layout.js` |
| Footer and about text | `components/SiteFooter.js`, `app/(site)/about/page.js` |
| Fonts | the Google Fonts link in `app/layout.js`, then `--font-display` / `--font-body` |

## Tests

`npm test` runs three suites with plain Node — no install, no build, no database
needed:

- **logic** — the Markdown renderer (including the escaping that stops a pasted
  `<script>` from running), slugs, excerpts, reading time, session signing
- **API behaviour** — the real route handlers, end to end against a live
  in-memory SQL database: signing in and out, publishing, drafts, duplicate web
  addresses, uploads, commenting while signed out, throttling, the spam
  honeypot, liking and unliking, one like per device, moderation, editing the
  like and view totals by hand, and deleting a story taking its comments and
  likes with it
- **structure** — every import resolves, every class name exists in the
  stylesheet, every JSX tag is closed, and every `fetch` in the UI hits a route
  that implements that method

## A note on security

- The admin session is an HMAC-signed, httpOnly cookie; a forged or expired one
  is rejected.
- Sign-in attempts are throttled, and comments are rate-limited per address with
  a honeypot field for bots.
- Story text is escaped before any HTML is produced, so a pasted `<script>` tag
  is printed, not run. `javascript:` links are stripped.
- `/admin` and `/api` are excluded from `robots.txt`.
- Change `ADMIN_PASSWORD` from anything you have shared, and never commit
  `.env.local`.
