import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS chat_tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(300) NOT NULL,
        detail TEXT DEFAULT '',
        source VARCHAR(50) DEFAULT 'feishu',
        schedule_text VARCHAR(200) DEFAULT '',
        status VARCHAR(30) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return NextResponse.json({ message: 'chat_tasks table created or exists' });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
