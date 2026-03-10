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
  syncStatus: string;
  syncedAt: string | null;
  remoteId: string | null;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'newslog.sqlite');
const DEFAULT_USER_ID = 'local-admin';

function tryExec(db: DatabaseSync, sqlText: string) {
  try {
    db.exec(sqlText);
  } catch {
    // ignore duplicate-column style migrations
  }
}

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
      sync_status TEXT NOT NULL DEFAULT 'pending',
      synced_at TEXT,
      remote_id TEXT,
      sync_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_news_entries_user_created
      ON news_entries(user_id, created_at DESC);
  `);
  tryExec(db, `ALTER TABLE news_entries ADD COLUMN sync_status TEXT NOT NULL DEFAULT 'pending'`);
  tryExec(db, `ALTER TABLE news_entries ADD COLUMN synced_at TEXT`);
  tryExec(db, `ALTER TABLE news_entries ADD COLUMN remote_id TEXT`);
  tryExec(db, `ALTER TABLE news_entries ADD COLUMN sync_error TEXT`);
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
          sync_status as syncStatus,
          synced_at as syncedAt,
          remote_id as remoteId,
          sync_error as syncError,
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
    syncStatus: 'pending',
    syncedAt: null,
    remoteId: null,
    syncError: null,
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
        sync_status,
        synced_at,
        remote_id,
        sync_error,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    entry.id,
    entry.userId,
    entry.title,
    entry.content,
    entry.source,
    entry.syncedFrom,
    entry.syncStatus,
    entry.syncedAt,
    entry.remoteId,
    entry.syncError,
    entry.createdAt,
    entry.updatedAt,
  );
  db.close();
  return entry;
}

export function listPendingNewsEntries(limit = 100): NewsEntry[] {
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
          sync_status as syncStatus,
          synced_at as syncedAt,
          remote_id as remoteId,
          sync_error as syncError,
          created_at as createdAt,
          updated_at as updatedAt
        FROM news_entries
        WHERE sync_status IN ('pending', 'failed')
        ORDER BY datetime(created_at) ASC
        LIMIT ?
      `,
    )
    .all(limit) as NewsEntry[];
  db.close();
  return rows;
}

export function markNewsEntrySynced(id: string, remoteId?: string | null) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `
      UPDATE news_entries
      SET
        sync_status = 'synced',
        synced_at = ?,
        remote_id = COALESCE(?, remote_id),
        sync_error = NULL,
        updated_at = ?
      WHERE id = ?
    `,
  ).run(now, remoteId || null, now, id);
  db.close();
}

export function markNewsEntryFailed(id: string, error: string) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `
      UPDATE news_entries
      SET
        sync_status = 'failed',
        sync_error = ?,
        updated_at = ?
      WHERE id = ?
    `,
  ).run(error.slice(0, 1000), now, id);
  db.close();
}
