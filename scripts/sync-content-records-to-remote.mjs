import dotenv from 'dotenv';
import { mkdirSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { sql } from '@vercel/postgres';

const APP_ROOT = process.cwd();
dotenv.config({ path: path.join(APP_ROOT, '.env.local') });
dotenv.config();

const WORKSPACE = '/Users/liangsai/.openclaw/workspace';
const DB_PATH = path.join(WORKSPACE, 'data', 'content-records.sqlite');
const LOG_FILE = path.join(WORKSPACE, 'logs', 'content-sync-remote.log');

function log(message) {
  mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${message}\n`, 'utf8');
}

function getLocalDb() {
  return new DatabaseSync(DB_PATH);
}

function listPendingRows(limit = 100) {
  const db = getLocalDb();
  const rows = db.prepare(`
    SELECT * FROM content_records
    WHERE sync_status IN ('pending', 'failed')
    ORDER BY datetime(created_at) ASC
    LIMIT ?
  `).all(limit);
  db.close();
  return rows;
}

function markSynced(id, remoteId) {
  const db = getLocalDb();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE content_records
    SET sync_status='synced', synced_at=?, remote_id=?, sync_error=NULL, updated_at=?
    WHERE id=?
  `).run(now, remoteId || null, now, id);
  db.close();
}

function markFailed(id, error) {
  const db = getLocalDb();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE content_records
    SET sync_status='failed', sync_error=?, updated_at=?
    WHERE id=?
  `).run(String(error).slice(0, 1000), now, id);
  db.close();
}

async function ensureRemoteSchema() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
    CREATE TABLE IF NOT EXISTS news_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID,
      title VARCHAR(300) NOT NULL,
      content TEXT NOT NULL,
      source VARCHAR(50) DEFAULT 'feishu',
      synced_from VARCHAR(50) DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  for (const stmt of [
    `ALTER TABLE news_entries ADD COLUMN remote_source_id TEXT`,
    `ALTER TABLE news_entries ADD COLUMN record_type VARCHAR(50) DEFAULT 'manual-news'`,
    `ALTER TABLE news_entries ADD COLUMN sync_status VARCHAR(30) DEFAULT 'synced'`,
    `ALTER TABLE news_entries ADD COLUMN synced_at TIMESTAMP`,
    `ALTER TABLE news_entries ADD COLUMN sync_error TEXT`,
  ]) {
    try {
      await sql.query(stmt);
    } catch {
      // ignore duplicate column / existing schema
    }
  }

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_news_entries_remote_source_id ON news_entries(remote_source_id)`;
}

async function main() {
  if (!process.env.POSTGRES_URL) throw new Error('POSTGRES_URL is missing');
  await ensureRemoteSchema();

  const users = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
  const remoteUserId = users.rows?.[0]?.id;
  if (!remoteUserId) throw new Error('remote admin user not found');

  const rows = listPendingRows(200);
  if (rows.length === 0) {
    log('summary no pending rows');
    console.log('No pending rows');
    return;
  }

  let synced = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const result = await sql`
        INSERT INTO news_entries (
          user_id, title, content, source, synced_from,
          created_at, updated_at, remote_source_id, record_type,
          sync_status, synced_at, sync_error
        ) VALUES (
          ${remoteUserId}, ${row.title}, ${row.content}, ${row.source}, ${row.source_trigger},
          ${row.created_at}, ${row.updated_at}, ${row.id}, ${row.record_type},
          'synced', NOW(), NULL
        )
        ON CONFLICT (remote_source_id)
        DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          source = EXCLUDED.source,
          synced_from = EXCLUDED.synced_from,
          updated_at = EXCLUDED.updated_at,
          record_type = EXCLUDED.record_type,
          sync_status = 'synced',
          synced_at = NOW(),
          sync_error = NULL
        RETURNING id
      `;
      markSynced(row.id, result.rows?.[0]?.id || null);
      synced += 1;
      log(`ok sync local=${row.id} type=${row.record_type} remote=${result.rows?.[0]?.id || 'unknown'}`);
    } catch (error) {
      failed += 1;
      markFailed(row.id, error instanceof Error ? error.message : String(error));
      log(`error sync local=${row.id} type=${row.record_type} error=${error instanceof Error ? error.message : String(error)}`);
    }
  }

  log(`summary pending=${rows.length} synced=${synced} failed=${failed}`);
  console.log(`Synced=${synced} Failed=${failed}`);
}

main().catch((error) => {
  log(`fatal ${error instanceof Error ? error.message : String(error)}`);
  console.error(error);
  process.exit(1);
});
