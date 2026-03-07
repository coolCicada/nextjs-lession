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
    // 创建表
    await sql`
      CREATE TABLE IF NOT EXISTS chat_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

    // 迁移：添加 next_run_at 字段（如果不存在）
    try {
      await sql`ALTER TABLE chat_tasks ADD COLUMN next_run_at TIMESTAMP`;
    } catch {
      // 字段已存在，忽略
    }

    return NextResponse.json({ message: 'chat_tasks table ready' });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
