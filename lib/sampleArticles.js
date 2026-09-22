/**
 * Placeholder content so a brand-new site is never a blank page.
 *
 * Every entry is deliberately generic — the excerpt says "placeholder" on
 * every card so nobody mistakes it for real reporting. Cover pictures come
 * from https://picsum.photos, a free service that returns a fixed photo for
 * a given seed, so the same story always shows the same picture with no
 * API key and no upload step. Replace or delete any of these from the
 * newsroom whenever you like — nothing about the site depends on them.
 */

const PLACEHOLDER_NOTE =
  'This is placeholder text added when SHAM was set up. Edit the headline, the picture and everything below from the newsroom, or delete the story — nothing else on the site depends on it.';

function photo(seed) {
  return 'https://picsum.photos/seed/' + seed + '/1200/675';
}

export const SAMPLE_ARTICLES = [
  {
    slug: 'coastal-cities-push-ahead-with-flood-defences',
    title: 'Coastal cities push ahead with new flood defences',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'World',
    tags: 'climate, infrastructure',
    featured: true,
    cover_image: photo('sham-world-1'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## A generic opening paragraph

Officials in several coastal cities have announced a new round of funding for sea walls, drainage upgrades and early-warning systems, citing a run of unusually high tides over the past two years.

## What comes next

Work is expected to begin within the year, with the first upgrades focused on low-lying neighbourhoods and transport links most exposed to flooding.

> Replace this pulled quote with a real line from someone you interviewed.

Write your own reporting here, or delete this story from the newsroom.`,
  },
  {
    slug: 'lawmakers-debate-new-digital-privacy-bill',
    title: 'Lawmakers debate new digital privacy bill',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'Politics',
    tags: 'policy, technology',
    cover_image: photo('sham-politics-1'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## Background

A proposed bill would set new rules for how companies collect and store personal data, with hearings scheduled over the coming weeks.

## Where it stands

Supporters say the measure is overdue; critics call parts of it unworkable. Both sides agree a vote is unlikely before the current session ends.

Write your own reporting here, or delete this story from the newsroom.`,
  },
  {
    slug: 'retailers-report-strong-start-to-the-season',
    title: 'Retailers report a strong start to the season',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'Business',
    tags: 'retail, economy',
    cover_image: photo('sham-business-1'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## The numbers

Early figures point to steady foot traffic and online sales running ahead of last year, though analysts caution the picture could shift closer to the season's end.

## What to watch

Shipping costs and staffing remain the two variables retailers mention most often when asked what could change the outlook.

Write your own reporting here, or delete this story from the newsroom.`,
  },
  {
    slug: 'new-chip-promises-longer-laptop-battery-life',
    title: 'A new chip promises longer battery life for laptops',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'Technology',
    tags: 'hardware, gadgets',
    cover_image: photo('sham-tech-1'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## The pitch

The chipmaker says the new design cuts power draw during everyday tasks like browsing and video calls, without giving up performance for heavier work.

## The catch

The first laptops using it are not expected until later in the year, and pricing has not been announced.

Write your own reporting here, or delete this story from the newsroom.`,
  },
  {
    slug: 'startups-lean-into-on-device-ai',
    title: 'Startups lean into on-device AI for privacy',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'Technology',
    tags: 'AI, startups, privacy',
    cover_image: photo('sham-tech-2'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## Why now

Running a model directly on a phone or laptop means the data never has to leave the device — a selling point for a growing list of smaller companies.

## The trade-off

On-device models are usually smaller and less capable than the ones running in a data centre, so most products still send some requests to the cloud.

Write your own reporting here, or delete this story from the newsroom.`,
  },
  {
    slug: 'museums-new-wing-opens-to-the-public',
    title: "The museum's new wing opens to the public this week",
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'World',
    tags: 'art, museums',
    cover_image: photo('sham-culture-1'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## What is inside

The new wing adds several galleries and a hall for touring exhibitions, doubling the space available for the permanent collection.

## Getting in

Entry is free on the opening weekend, with timed tickets after that.

Write your own reporting here, or delete this story from the newsroom.`,
  },
  {
    slug: 'underdog-team-clinches-place-in-the-finals',
    title: 'Underdog team clinches a place in the finals',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'Sport',
    tags: 'match report',
    cover_image: photo('sham-sport-1'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## How it happened

A late goal settled a tense contest, sending the lower-ranked side through to the final for the first time in a decade.

## What is next

The final is set for later this month, with the winner earning a place in next season's continental competition.

Write your own reporting here, or delete this story from the newsroom.`,
  },
  {
    slug: 'why-small-towns-deserve-better-broadband',
    title: 'Why small towns deserve better broadband',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'Opinion',
    tags: 'infrastructure, rural',
    cover_image: photo('sham-opinion-1'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## The argument

Fast, reliable internet has become as basic as electricity or water, yet plenty of small towns are still waiting for a serious upgrade.

## The counter-case

Building out a network to a handful of houses down a long rural road costs the same as wiring a city block of hundreds — which is exactly why it keeps getting put off.

Write your own opinion piece here, or delete this story from the newsroom.`,
  },
  {
    slug: 'five-weekend-recipes-worth-the-extra-effort',
    title: 'Five weekend recipes worth the extra effort',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'World',
    tags: 'food, weekend',
    cover_image: photo('sham-lifestyle-1'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## The idea

None of these need a special trip to the shops — just a slower Saturday and a bit more patience than a weeknight allows.

## The list

1. A slow-braised stew that mostly looks after itself
2. Bread, if you have never tried
3. A layer cake worth the washing up
4. A proper stock, frozen in portions for the month ahead
5. Something you have never cooked before

Write your own recipes here, or delete this story from the newsroom.`,
  },
  {
    slug: 'trade-talks-resume-after-a-month-long-pause',
    title: 'Trade talks resume after a month-long pause',
    excerpt: 'Placeholder story — edit the headline, picture and text from the newsroom, or delete it.',
    category: 'World',
    tags: 'trade, diplomacy',
    cover_image: photo('sham-world-2'),
    cover_credit: 'Placeholder photograph',
    content: `${PLACEHOLDER_NOTE}

## Why they stopped

Negotiators walked away last month over a disagreement on tariffs; both sides have since said they are ready to talk again.

## What is on the table

A new round of meetings is scheduled, though officials on both sides are downplaying expectations of a quick deal.

Write your own reporting here, or delete this story from the newsroom.`,
  },
];
