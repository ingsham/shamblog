/**
 * Static checks that do not need a build:
 *  - every local import resolves to a real file
 *  - every named import actually exists in the module it comes from
 *  - every className used in the app exists in globals.css
 *  - JSX component tags open and close in equal numbers
 *  - every fetch from the UI hits a route that implements that method
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const problems = [];
const warnings = [];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', 'tests'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|mjs|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk(root);
const exportCache = new Map();

function exportsOf(file) {
  if (exportCache.has(file)) return exportCache.get(file);
  const src = fs.readFileSync(file, 'utf8');
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:const|let|var|class)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) names.add(name);
    }
  }
  if (/export\s+default/.test(src)) names.add('default');
  exportCache.set(file, names);
  return names;
}

function resolveLocal(spec, from) {
  const base = spec.startsWith('@/') ? path.join(root, spec.slice(2)) : path.resolve(path.dirname(from), spec);
  for (const candidate of [base, base + '.js', base + '.jsx', path.join(base, 'index.js')]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);

  for (const m of src.matchAll(/import\s+([^;]*?)\s*from\s*['"]([^'"]+)['"]/g)) {
    const clause = m[1];
    const spec = m[2];
    if (!spec.startsWith('@/') && !spec.startsWith('.')) continue;
    const target = resolveLocal(spec, file);
    if (!target) {
      problems.push(rel + ': import "' + spec + '" does not resolve to a file');
      continue;
    }
    const available = exportsOf(target);
    const named = clause.match(/\{([^}]*)\}/);
    if (named) {
      for (const part of named[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/)[0].trim();
        if (name && !available.has(name)) {
          problems.push(rel + ': "' + name + '" is not exported by ' + spec);
        }
      }
    }
    if (/^\s*[A-Za-z0-9_$]+\s*(,|$)/.test(clause) && !available.has('default')) {
      problems.push(rel + ': ' + spec + ' has no default export');
    }
  }

  // JSX component tags must balance. Arrow functions inside props contain a
  // ">" of their own, so they are masked before the tags are counted.
  const masked = src.replace(/=>/g, '=\u00bb');
  const opened = [...masked.matchAll(/<([A-Z][A-Za-z0-9]*)(\s[^<>]*?)?(\/?)>/g)];
  const counts = new Map();
  for (const tag of opened) {
    if (tag[3] === '/') continue;
    counts.set(tag[1], (counts.get(tag[1]) || 0) + 1);
  }
  for (const m of masked.matchAll(/<\/([A-Z][A-Za-z0-9]*)>/g)) {
    counts.set(m[1], (counts.get(m[1]) || 0) - 1);
  }
  for (const [tag, n] of counts) {
    if (n !== 0) problems.push(rel + ': <' + tag + '> opens and closes ' + Math.abs(n) + ' time(s) out of step');
  }
}

// className values should exist in the stylesheet.
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
const defined = new Set([...css.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]));
const used = new Set();
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/className=["']([^"'{]+)["']/g)) {
    for (const name of m[1].split(/\s+/)) if (name) used.add(name);
  }
  for (const m of src.matchAll(/className=\{[^}]*?['"]([a-z][a-z0-9- ]*)['"]/g)) {
    for (const name of m[1].split(/\s+/)) if (name) used.add(name);
  }
}
const allSource = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
for (const name of used) {
  if (defined.has(name)) continue;
  // Values compared against inside a className expression are not class names.
  if (allSource.includes("=== '" + name + "'")) continue;
  warnings.push('class "' + name + '" is used but not defined in globals.css');
}


// Every fetch the browser makes must land on a route file that implements that
// method, so a renamed endpoint is caught here rather than in production.
function routeFileFor(apiPath) {
  const segments = apiPath.replace(/^\/api\//, '').split('/').filter(Boolean);
  let dir = path.join(root, 'app', 'api');
  for (const segment of segments) {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir);
    const next =
      entries.find((e) => e === segment) ||
      entries.find((e) => e.startsWith('[') && e.endsWith(']'));
    if (!next) return null;
    dir = path.join(dir, next);
  }
  const file = path.join(dir, 'route.js');
  return fs.existsSync(file) ? file : null;
}

for (const file of files) {
  if (file.includes(path.join(root, 'app', 'api'))) continue;
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/fetch\(\s*['"`](\/api\/[^'"`?\s]*)/g)) {
    // A literal ending in "/" is followed by an id, so it targets the
    // dynamic child route: /api/articles/ + id  ->  app/api/articles/[id].
    const apiPath = m[1].endsWith('/') ? m[1] + 'id' : m[1];
    const window = src.slice(m.index, m.index + 400);
    const ternary = /method:\s*[\w.]+\s*\?\s*['"](\w+)['"]\s*:\s*['"](\w+)['"]/.exec(window);
    const plain = /method:\s*['"](\w+)['"]/.exec(window);
    const methods = ternary ? [ternary[1], ternary[2]] : [plain ? plain[1] : 'GET'];
    const routeFile = routeFileFor(apiPath);
    if (!routeFile) {
      problems.push(apiPath + ' is fetched in ' + path.relative(root, file) + ' but has no route file');
      continue;
    }
    const handlers = fs.readFileSync(routeFile, 'utf8');
    for (const method of methods) {
      if (!new RegExp('export async function ' + method + '\\b').test(handlers)) {
        problems.push(
          apiPath + ' is called with ' + method + ' in ' + path.relative(root, file) + ' but the route has no ' + method + ' handler'
        );
      }
    }
  }
}

console.log('\nstatic checks');
console.log('  files scanned: ' + files.length);
for (const w of warnings) console.log('  warn ' + w);
for (const p of problems) console.log('  FAIL ' + p);
if (problems.length === 0)
  console.log('  ok   imports, exports, JSX tags and API routes all line up');
console.log('');
process.exit(problems.length === 0 ? 0 : 1);

