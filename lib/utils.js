export const CATEGORIES = [
  'World',
  'Politics',
  'Business',
  'Technology',
  'Culture',
  'Sport',
  'Opinion',
  'Lifestyle',
];

// Each category carries its own hue. The article page and its tags pick this up,
// so readers learn to recognise a section by colour before they read the label.
const CATEGORY_HUES = {
  World: '#1F6F5C',
  Politics: '#B23A48',
  Business: '#8A5A2B',
  Technology: '#3A4FB8',
  Culture: '#8B3FA0',
  Sport: '#2F7D32',
  Opinion: '#C2410C',
  Lifestyle: '#A8326B',
};

export function categoryHue(name) {
  return CATEGORY_HUES[name] || '#D6412B';
}

export function slugify(input) {
  return (
    String(input || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/['\u2019"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'untitled'
  );
}

export function readingTime(markdown) {
  const words = String(markdown || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function timeAgo(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const steps = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [size, label] of steps) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return n + ' ' + label + (n > 1 ? 's' : '') + ' ago';
    }
  }
  return 'just now';
}

export function toExcerpt(markdown, limit = 180) {
  const text = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= limit) return text;
  const cut = text.lastIndexOf(' ', limit);
  return text.slice(0, cut > 0 ? cut : limit) + '\u2026';
}

export function parseTags(value) {
  if (Array.isArray(value)) value = value.join(',');
  return String(value || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    const trimmed = explicit.trim().replace(/\/+$/, '');
    // Tolerates "sham.vercel.app" as well as a full URL, so a missing
    // protocol in the dashboard cannot fail the build.
    return /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL;
  }
  if (process.env.VERCEL_URL) return 'https://' + process.env.VERCEL_URL;
  return 'http://localhost:3000';
}

export function clampInt(value, min, max, fallback = 0) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
