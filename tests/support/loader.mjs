/**
 * Lets the real route handlers run under plain Node: `@/...` imports resolve
 * the way Next resolves them, `pg` is swapped for a SQLite-backed stand-in, and
 * `next/server` / `next/headers` get small stubs. Nothing in app/ or lib/ is
 * modified for the tests.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';

const root = path.resolve(import.meta.dirname, '..', '..');
const support = pathToFileURL(path.join(root, 'tests', 'support')).href;

const REPLACEMENTS = {
  pg: support + '/pg-sqlite.mjs',
  'next/server': support + '/next-server.mjs',
  'next/headers': support + '/next-headers.mjs',
  'next/navigation': support + '/next-navigation.mjs',
};

export async function resolve(specifier, context, nextResolve) {
  if (REPLACEMENTS[specifier]) {
    return { url: REPLACEMENTS[specifier], shortCircuit: true };
  }
  if (specifier.startsWith('@/')) {
    const base = path.join(root, specifier.slice(2));
    const candidates = [base, base + '.js', base + '.jsx', path.join(base, 'index.js')];
    const found = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
    return { url: pathToFileURL(found || base).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
