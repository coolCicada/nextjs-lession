import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

export type NewsEntry = {
  id: string;
  userId: string;
  title: string;
  content: string;
  source: string;
  syncedFrom: string;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'newslog.sqlite');
const DEFAULT_USER_ID = 'local-admin';

function getDb() {
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS news_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'feishu',
      synced_from TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_news_entries_user_created
      ON news_entries(user_id, created_at DESC);
  `);
  return db;
}

export function resolveNewsUserId(input?: string | null) {
  return (input || '').trim() || DEFAULT_USER_ID;
}

export function listNewsEntries(userId?: string | null): NewsEntry[] {
  const resolvedUserId = resolveNewsUserId(userId);
  const db = getDb();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          user_id as userId,
          title,
          content,
          source,
          synced_from as syncedFrom,
          created_at as createdAt,
          updated_at as updatedAt
        FROM news_entries
        WHERE user_id IN (?, ?)
        ORDER BY datetime(created_at) DESC
        LIMIT 300
      `,
    )
    .all(resolvedUserId, DEFAULT_USER_ID) as NewsEntry[];
  db.close();
  return rows;
}

export function insertNewsEntry(input: {
  userId?: string | null;
  title: string;
  content: string;
  source?: string | null;
  syncedFrom?: string | null;
}) {
  const now = new Date().toISOString();
  const entry: NewsEntry = {
    id: randomUUID(),
    userId: resolveNewsUserId(input.userId),
    title: input.title.trim(),
    content: input.content.trim(),
    source: (input.source || 'feishu').trim() || 'feishu',
    syncedFrom: (input.syncedFrom || 'manual').trim() || 'manual',
    createdAt: now,
    updatedAt: now,
  };

  const db = getDb();
  db.prepare(
    `
      INSERT INTO news_entries (
        id,
        user_id,
        title,
        content,
        source,
        synced_from,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    entry.id,
    entry.userId,
    entry.title,
    entry.content,
    entry.source,
    entry.syncedFrom,
    entry.createdAt,
    entry.updatedAt,
  );
  db.close();
  return entry;
}
