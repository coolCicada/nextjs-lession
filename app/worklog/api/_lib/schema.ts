import { sql } from '@vercel/postgres';

async function ensureUsersTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(200) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    INSERT INTO users (username, password_hash)
    VALUES ('admin', 'admin123')
    ON CONFLICT (username) DO NOTHING
  `;
}

async function getAdminUserId(): Promise<string> {
  const { rows } = await sql`
    SELECT id
    FROM users
    WHERE username = 'admin'
    LIMIT 1
  `;

  if (!rows[0]?.id) {
    throw new Error('admin user not found');
  }

  return rows[0].id as string;
}

async function ensureChatTasksTable(adminUserId: string) {
  await sql`
    CREATE TABLE IF NOT EXISTS chat_tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(300) NOT NULL,
      detail TEXT DEFAULT '',
      source VARCHAR(50) DEFAULT 'feishu',
      schedule_text VARCHAR(200) DEFAULT '',
      status VARCHAR(30) DEFAULT 'active',
      next_run_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`ALTER TABLE chat_tasks ADD COLUMN IF NOT EXISTS user_id UUID`;
  await sql`ALTER TABLE chat_tasks ADD COLUMN IF NOT EXISTS detail TEXT DEFAULT ''`;
  await sql`ALTER TABLE chat_tasks ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'feishu'`;
  await sql`ALTER TABLE chat_tasks ADD COLUMN IF NOT EXISTS schedule_text VARCHAR(200) DEFAULT ''`;
  await sql`ALTER TABLE chat_tasks ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active'`;
  await sql`ALTER TABLE chat_tasks ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMP`;
  await sql`ALTER TABLE chat_tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
  await sql`ALTER TABLE chat_tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;

  await sql`
    UPDATE chat_tasks
    SET user_id = ${adminUserId}
    WHERE user_id IS NULL
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_chat_tasks_user_schedule
    ON chat_tasks(user_id, COALESCE(next_run_at, created_at) DESC)
  `;
}

async function ensureNewsEntriesTable(adminUserId: string) {
  await sql`
    CREATE TABLE IF NOT EXISTS news_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(300) NOT NULL,
      content TEXT NOT NULL,
      source VARCHAR(50) DEFAULT 'feishu',
      synced_from VARCHAR(50) DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`ALTER TABLE news_entries ADD COLUMN IF NOT EXISTS user_id UUID`;
  await sql`ALTER TABLE news_entries ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'feishu'`;
  await sql`ALTER TABLE news_entries ADD COLUMN IF NOT EXISTS synced_from VARCHAR(50) DEFAULT 'manual'`;
  await sql`ALTER TABLE news_entries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
  await sql`ALTER TABLE news_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;

  await sql`
    UPDATE news_entries
    SET user_id = ${adminUserId}
    WHERE user_id IS NULL
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_news_entries_user_created
    ON news_entries(user_id, created_at DESC)
  `;
}

export async function ensureWorklogSchema() {
  await ensureUsersTable();
  const adminUserId = await getAdminUserId();
  await ensureChatTasksTable(adminUserId);
  await ensureNewsEntriesTable(adminUserId);
}
