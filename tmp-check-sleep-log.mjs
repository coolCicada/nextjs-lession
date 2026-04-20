import { readFileSync } from 'node:fs';
import { sql } from '@vercel/postgres';

const envText = readFileSync('/Users/liangsai/.hermes/workspace/nextjs-lession/.env.local', 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const rows = await sql`SELECT id, sleep_date, confirmed_at, original_text FROM sleep_logs WHERE sleep_date IN ('2026-04-16','2026-04-17') ORDER BY sleep_date`;
console.log(JSON.stringify(rows.rows, null, 2));
