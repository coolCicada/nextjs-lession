import 'dotenv/config';
import { sql } from '@vercel/postgres';

const today = new Date().toISOString().slice(0, 10);

try {
  const r = await sql`
    SELECT confirmed_at, original_text 
    FROM sleep_logs 
    WHERE sleep_date = ${today} 
      AND user_id = (SELECT id FROM users WHERE username = 'admin' LIMIT 1)
    LIMIT 1
  `;
  console.log(JSON.stringify(r.rows));
} catch(e) {
  console.log(JSON.stringify({error: e.message}));
}
