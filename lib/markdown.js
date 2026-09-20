/**
 * A small, dependency-free Markdown renderer.
 *
 * Everything is HTML-escaped before any markup is generated, so the output is
 * safe to inject with dangerouslySetInnerHTML. The same function runs in the
 * editor preview and on the published page, so what the writer sees is exactly
 * what readers get.
 */

const PLACEHOLDER = '\u0000';

export function escapeHtml(input) {
  return String(input === null || input === undefined ? '' : input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeUrl(raw) {
  const url = String(raw || '').trim();
  if (!url) return '';
  if (/^(https?:\/\/|mailto:|tel:|\/|#|\.\/|\.\.\/)/i.test(url)) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '';
  return url;
}

function inline(text, store) {
  let out = escapeHtml(text);

  // Inline code is protected first so nothing else formats inside it.
  out = out.replace(/`([^`\n]+)`/g, (_m, code) => {
    store.push('<code>' + code + '</code>');
    return PLACEHOLDER + (store.length - 1) + PLACEHOLDER;
  });

  // Images before links: ![alt](src)
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, src) => {
    const url = safeUrl(src);
    if (!url) return alt;
    return '<img src="' + url + '" alt="' + alt + '" loading="lazy" decoding="async" />';
  });

  // Links: [text](href)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, href) => {
    const url = safeUrl(href);
    if (!url) return label;
    const external = /^https?:\/\//i.test(url);
    return (
      '<a href="' +
      url +
      '"' +
      (external ? ' target="_blank" rel="noopener noreferrer"' : '') +
      '>' +
      label +
      '</a>'
    );
  });

  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  out = out.replace(/(^|[^*\w])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/(^|[^_\w])_([^_\n]+)_/g, '$1<em>$2</em>');

  // Restore protected code spans.
  out = out.replace(new RegExp(PLACEHOLDER + '(\\d+)' + PLACEHOLDER, 'g'), (_m, i) => store[Number(i)]);
  return out;
}

export function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export function renderMarkdown(source) {
  const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
  const store = [];
  const html = [];
  let i = 0;

  const isBlank = (l) => !l || !l.trim();

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    // Fenced code block
    const fence = line.match(/^```\s*([a-zA-Z0-9+#-]*)\s*$/);
    if (fence) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1;
      const lang = fence[1] ? ' class="language-' + escapeHtml(fence[1]) + '"' : '';
      html.push('<pre><code' + lang + '>' + escapeHtml(body.join('\n')) + '</code></pre>');
      continue;
    }

    // Horizontal rule
    if (/^\s*(\*\s*){3,}$/.test(line) || /^\s*(-\s*){3,}$/.test(line) || /^\s*(_\s*){3,}$/.test(line)) {
      html.push('<hr />');
      i += 1;
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = inline(heading[2].trim(), store);
      const id = slugifyHeading(heading[2].trim());
      html.push('<h' + level + ' id="' + id + '">' + text + '</h' + level + '>');
      i += 1;
      continue;
    }

    // Blockquote (supports a trailing "— Attribution" line)
    if (/^>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      html.push('<blockquote>' + inline(body.join(' ').trim(), store) + '</blockquote>');
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*[-*+]\s+/, ''), store));
        i += 1;
      }
      html.push('<ul>' + items.map((t) => '<li>' + t + '</li>').join('') + '</ul>');
      continue;
    }

    // Ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*\d+[.)]\s+/, ''), store));
        i += 1;
      }
      html.push('<ol>' + items.map((t) => '<li>' + t + '</li>').join('') + '</ol>');
      continue;
    }

    // Paragraph: gather until a blank line or the start of another block.
    const paragraph = [];
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }
    const joined = paragraph.join('\n').trim();
    const rendered = inline(joined, store).replace(/\n/g, '<br />');

    // A paragraph holding nothing but an image becomes a captioned figure.
    const lone = rendered.match(/^<img src="[^"]*" alt="([^"]*)"[^>]*\/>$/);
    if (lone) {
      html.push(
        '<figure class="md-figure">' +
          rendered +
          (lone[1] ? '<figcaption>' + lone[1] + '</figcaption>' : '') +
          '</figure>'
      );
    } else {
      html.push('<p>' + rendered + '</p>');
    }
  }

  return html.join('\n');
}
