/**
 * Checks that every HTML element opened in JSX is also closed. Catches the
 * unclosed <div> that would otherwise only surface during a build.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr']);
let failures = 0;
let scanned = 0;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', 'tests', 'scripts'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.jsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

for (const file of walk(root)) {
  const rel = path.relative(root, file);
  // Strings are emptied first: markup written inside a string literal (XML
  // builders, placeholder text) is not JSX structure and must not be counted.
  const src = fs
    .readFileSync(file, 'utf8')
    .replace(/=>/g, '=\u00bb')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/'(?:\\.|[^'\\\n])*'/g, "''")
    .replace(/"(?:\\.|[^"\\\n])*"/g, '""')
    .replace(/`(?:\\.|[^`\\])*`/g, '``');
  if (!/<[a-zA-Z]/.test(src)) continue;
  scanned += 1;

  const counts = new Map();
  const bump = (tag, n) => counts.set(tag, (counts.get(tag) || 0) + n);

  for (const m of src.matchAll(/<([a-z][a-z0-9]*)(\s[^<>]*?)?(\/?)>/g)) {
    const tag = m[1];
    if (VOID.has(tag) || m[3] === '/') continue;
    bump(tag, 1);
  }
  for (const m of src.matchAll(/<\/([a-z][a-z0-9]*)>/g)) bump(m[1], -1);

  for (const [tag, n] of counts) {
    if (n !== 0) {
      failures += 1;
      console.log('  FAIL ' + rel + ': <' + tag + '> is out of step by ' + n);
    }
  }
}

console.log('\njsx balance');
console.log('  files with markup scanned: ' + scanned);
if (failures === 0) console.log('  ok   every element opened is closed\n');
process.exit(failures === 0 ? 0 : 1);
