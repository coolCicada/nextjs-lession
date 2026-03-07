import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 飞书调用接口添加待办
export async function POST(request: Request) {
  try {
    const { text, source = 'feishu' } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO todos (text, source)
      VALUES (${text}, ${source})
      RETURNING id, text, completed, source, created_at as "createdAt"
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error adding todo:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 获取所有待办
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT id, text, completed, source, created_at as "createdAt"
      FROM todos
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
