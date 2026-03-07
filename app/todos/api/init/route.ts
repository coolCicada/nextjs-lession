import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 创建表（如果不存在）
export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        text VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        source VARCHAR(50) DEFAULT 'web',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    return NextResponse.json({ message: 'Table created or exists' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
