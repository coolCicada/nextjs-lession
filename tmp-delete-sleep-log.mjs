import { readFileSync } from 'node:fs';
import { sql } from '@vercel/postgres';

const envText = readFileSync('/Users/liangsai/.hermes/workspace/nextjs-lession/.env.local', 'utf8');
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const id = '2df51cc8-2be0-4895-8332-a41717cde469';
const rows = await sql`DELETE FROM sleep_logs WHERE id = ${id} RETURNING id, sleep_date, confirmed_at, original_text`;
console.log(JSON.stringify(rows.rows, null, 2));
