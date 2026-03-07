import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

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

// 添加待办
export async function POST(request: Request) {
  try {
    const { text, source = 'web' } = await request.json();
    const { rows } = await sql`
      INSERT INTO todos (text, source)
      VALUES (${text}, ${source})
      RETURNING id, text, completed, source, created_at as "createdAt"
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 更新待办
export async function PUT(request: Request) {
  try {
    const { id, completed } = await request.json();
    await sql`
      UPDATE todos SET completed = ${completed} WHERE id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 删除待办
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await sql`DELETE FROM todos WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
