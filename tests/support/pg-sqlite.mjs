/**
 * A stand-in for `pg` that runs the application's real SQL against an in-memory
 * SQLite database. Postgres-only spellings are rewritten on the way through, so
 * the queries under test are the ones that ship.
 */
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON');

function translate(sql) {
  return sql
    .replace(/\bSERIAL PRIMARY KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
    .replace(/\bTIMESTAMPTZ\b/gi, 'TEXT')
    .replace(/\bBYTEA\b/gi, 'BLOB')
    .replace(/\bBOOLEAN\b/gi, 'INTEGER')
    .replace(/\bDEFAULT TRUE\b/gi, 'DEFAULT 1')
    .replace(/\bDEFAULT FALSE\b/gi, 'DEFAULT 0')
    // SQLite only accepts a function call as a column default inside brackets.
    .replace(/\bDEFAULT NOW\(\)/gi, "DEFAULT (STRFTIME('%Y-%m-%dT%H:%M:%fZ','now'))")
    .replace(/\bNOW\(\)/gi, "STRFTIME('%Y-%m-%dT%H:%M:%fZ','now')")
    .replace(/::int\b/gi, '')
    .replace(/\bILIKE\b/gi, 'LIKE')
    .replace(/\bAND a\.approved\b/g, 'AND a.approved = 1')
    .replace(/\bAND c\.approved\b/g, 'AND c.approved = 1')
    .replace(/\bAND approved\b/g, 'AND approved = 1');
}

function bindable(value) {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (Buffer.isBuffer(value)) return new Uint8Array(value);
  if (typeof value === 'number' || typeof value === 'bigint') return value;
  return String(value);
}

export class Pool {
  constructor() {
    this.ended = false;
  }

  async query(text, params = []) {
    const sql = translate(text);
    const named = {};
    params.forEach((value, index) => {
      named[String(index + 1)] = bindable(value);
    });

    const statement = db.prepare(sql);
    try {
      const rows = statement.all(named);
      return { rows, rowCount: rows.length };
    } catch (err) {
      if (!/does not return data|cannot return/i.test(err.message)) throw err;
      const info = statement.run(named);
      return { rows: [], rowCount: Number(info.changes || 0) };
    }
  }

  async end() {
    this.ended = true;
  }
}

export function reset() {
  for (const table of ['likes', 'comments', 'images', 'subscribers', 'articles']) {
    try {
      db.exec('DELETE FROM ' + table);
    } catch (err) {
      /* table not created yet */
    }
  }
}

export default { Pool };
