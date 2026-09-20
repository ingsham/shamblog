/**
 * Runs with plain Node, no test framework and no install:  npm test
 * Covers the pure logic that the site's correctness and safety depend on.
 */
import assert from 'node:assert/strict';
import { renderMarkdown, escapeHtml, safeUrl } from '../lib/markdown.js';
import {
  slugify,
  readingTime,
  toExcerpt,
  parseTags,
  clampInt,
  categoryHue,
  CATEGORIES,
} from '../lib/utils.js';
import { createToken, verifyToken } from '../lib/session.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log('  ok   ' + name);
  } catch (err) {
    failed += 1;
    console.log('  FAIL ' + name + '\n       ' + err.message);
  }
}

console.log('\nmarkdown');

test('renders headings, paragraphs and emphasis', () => {
  const html = renderMarkdown('# Title\n\nSome **bold** and *italic* text.');
  assert.match(html, /<h1 id="title">Title<\/h1>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
});

test('renders lists, quotes and rules', () => {
  const html = renderMarkdown('- one\n- two\n\n> quoted\n\n---');
  assert.match(html, /<ul><li>one<\/li><li>two<\/li><\/ul>/);
  assert.match(html, /<blockquote>quoted<\/blockquote>/);
  assert.match(html, /<hr \/>/);
});

test('renders ordered lists', () => {
  assert.match(renderMarkdown('1. first\n2. second'), /<ol><li>first<\/li><li>second<\/li><\/ol>/);
});

test('links open safely off-site', () => {
  const html = renderMarkdown('[SHAM](https://example.com)');
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('a lone image becomes a captioned figure', () => {
  const html = renderMarkdown('![A harbour at dawn](/api/images/abc.jpg)');
  assert.match(html, /<figure class="md-figure">/);
  assert.match(html, /<figcaption>A harbour at dawn<\/figcaption>/);
  assert.ok(!html.includes('<p><figure'), 'a figure must not be nested inside a paragraph');
});

test('an image beside text stays inline and valid', () => {
  const html = renderMarkdown('Look: ![pic](/a.jpg) there.');
  assert.match(html, /^<p>Look: <img /);
  assert.ok(!html.includes('<figure'));
});

test('code fences are preserved and escaped', () => {
  const html = renderMarkdown('```js\nconst a = 1 < 2;\n```');
  assert.match(html, /<pre><code class="language-js">const a = 1 &lt; 2;<\/code><\/pre>/);
});

test('markdown inside inline code is not formatted', () => {
  assert.match(renderMarkdown('use `**not bold**` here'), /<code>\*\*not bold\*\*<\/code>/);
});

test('raw HTML in a post cannot execute', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
  assert.ok(!html.includes('<script>'), 'script tags must be escaped');
  assert.ok(!/<img[^>]*onerror/i.test(html), 'no live img tag may be produced');
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test('javascript: urls are stripped from links and images', () => {
  const html = renderMarkdown('[x](javascript:alert(1))\n\n![y](javascript:alert(1))');
  assert.ok(!html.toLowerCase().includes('javascript:'));
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('/api/images/a.jpg'), '/api/images/a.jpg');
  assert.equal(safeUrl('https://example.com'), 'https://example.com');
});

test('a quote mark in text cannot break out of an attribute', () => {
  const html = renderMarkdown('![" onload="alert(1)](/a.jpg)');
  assert.ok(!/alt="[^"]*"\s+onload/i.test(html), 'the alt text must stay inside its attribute');
  assert.match(html, /alt="&quot; onload=&quot;alert\(1\)"/);
});

test('escapeHtml covers every dangerous character', () => {
  assert.equal(escapeHtml(`<>&"'`), '&lt;&gt;&amp;&quot;&#39;');
});

test('empty input renders nothing rather than crashing', () => {
  assert.equal(renderMarkdown(''), '');
  assert.equal(renderMarkdown(null), '');
});

console.log('\nutilities');

test('slugify makes clean, unique-ish web addresses', () => {
  assert.equal(slugify('Ghana’s Economy: What Next?'), 'ghanas-economy-what-next');
  assert.equal(slugify('   '), 'untitled');
  assert.equal(slugify('Café Déjà Vu'), 'cafe-deja-vu');
  assert.ok(slugify('x'.repeat(200)).length <= 80);
});

test('reading time is at least one minute', () => {
  assert.equal(readingTime(''), 1);
  assert.equal(readingTime('word '.repeat(440)), 2);
});

test('excerpts strip markup and end on a word', () => {
  const out = toExcerpt('## Heading\n\nThe **quick** brown fox jumps over the lazy dog. '.repeat(10), 60);
  assert.ok(out.length <= 62, 'excerpt should respect the limit');
  assert.ok(!out.includes('**'));
  assert.ok(!out.includes('##'));
});

test('tags are trimmed, de-blanked and capped', () => {
  assert.deepEqual(parseTags(' a , b ,, c '), ['a', 'b', 'c']);
  assert.equal(parseTags('1,2,3,4,5,6,7,8,9,10').length, 8);
  assert.deepEqual(parseTags(['x', 'y']), ['x', 'y']);
});

test('clampInt keeps numbers in range', () => {
  assert.equal(clampInt('500', 1, 50, 10), 50);
  assert.equal(clampInt('abc', 1, 50, 10), 10);
});

test('every section has its own colour', () => {
  const hues = new Set(CATEGORIES.map(categoryHue));
  assert.equal(hues.size, CATEGORIES.length);
});

console.log('\nadmin sessions');

test('a freshly issued token verifies', () => {
  assert.equal(verifyToken(createToken()), true);
});

test('a tampered token is rejected', () => {
  const token = createToken();
  assert.equal(verifyToken(token.slice(0, -2) + 'xx'), false);
  assert.equal(verifyToken('admin.' + (Date.now() + 100000) + '.forged'), false);
});

test('an expired token is rejected', () => {
  assert.equal(verifyToken(createToken(-1)), false);
});

test('junk is rejected without throwing', () => {
  assert.equal(verifyToken(''), false);
  assert.equal(verifyToken(null), false);
  assert.equal(verifyToken('a.b'), false);
  assert.equal(verifyToken('reader.999999999999.x'), false);
});

console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed === 0 ? 0 : 1);
