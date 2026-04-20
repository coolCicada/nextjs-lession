import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

export async function GET() {
  return handleInit();
}

export async function POST() {
  return handleInit();
}

async function handleInit() {
  try {
    // 创建用户表
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建待办表（带用户ID）
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

    // 创建新闻记录表（分析结果同步）
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

    await sql`CREATE INDEX IF NOT EXISTS idx_news_entries_user_created ON news_entries(user_id, created_at DESC)`;

    // 创建默认用户（如果没有）
    const { rows } = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
    if (rows.length === 0) {
      await sql`
        INSERT INTO users (username, password_hash)
        VALUES ('admin', 'admin123')
      `;
    }

    return NextResponse.json({ message: 'database initialized' });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
