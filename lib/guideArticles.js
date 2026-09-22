/**
 * A few short posts explaining the site to whoever just set it up. Kept
 * separate from lib/sampleArticles.js because these describe SHAM itself
 * rather than standing in for real news — delete them from the newsroom
 * once you don't need the reminder.
 */

export const GUIDE_ARTICLES = [
  {
    slug: 'welcome-to-sham',
    title: 'Welcome to SHAM',
    excerpt:
      'A short tour of the site you have just put online, and how to make the first story your own.',
    category: 'Opinion',
    tags: 'about, getting started',
    content: `This page is a sample. Open the newsroom, edit it, or delete it — nothing here is fixed.

## Writing a story

Everything is written in Markdown. **Bold**, *italic*, [links](https://example.com), lists and quotes all work, and the toolbar above the editor inserts them for you.

> Pull out a line like this when it deserves its own space.

## Pictures

Use the lead picture panel for the image at the top of a story, and the "Insert picture" button to drop one into the body. Both take files straight from your computer, shrink them in your browser and store them with the story.

## Readers

Nobody needs an account to like a story or leave a comment. You can edit, pin, hide or delete any comment from the Comments page, and set the like and view numbers by hand from the story editor.`,
  },
  {
    slug: 'how-the-sections-work',
    title: 'How the sections work',
    excerpt: 'Every section carries its own colour, so readers learn where they are before they read the label.',
    category: 'World',
    tags: 'design, sections',
    content: `Each section — World, Politics, Business, Technology, Poems, Sport and Opinion — has a colour of its own. It runs through the kicker above a headline, the links inside the story, the reading progress bar and the like button.

The effect is quiet on any single page and useful across many: after a few visits, readers recognise a section at a glance.

To change which sections exist, edit the list at the top of \`lib/utils.js\` and give each one a colour.`,
  },
  {
    slug: 'sharing-and-search',
    title: 'Sharing, search and the Friday email',
    excerpt: 'The three things that bring readers back, and where to find them.',
    category: 'Technology',
    tags: 'sharing, seo',
    content: `Every story carries share buttons for X, Facebook, WhatsApp, LinkedIn, Telegram, Reddit and email, plus a copy-link button and the phone's own share sheet where it exists.

Search covers headlines, standfirsts, tags and the full text of every published piece.

The sign-up form at the foot of the page collects addresses into the Subscribers page, ready to paste into whatever you send the Friday email with.

Search engines get a sitemap at \`/sitemap.xml\`, a feed at \`/rss.xml\`, and proper preview cards when a link is pasted into a chat or a timeline.`,
  },
];
