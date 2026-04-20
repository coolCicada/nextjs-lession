import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

function getUserIdFromToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

// 获取当前登录用户的待办
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromToken(request.headers.get('authorization'));
    if (!userId) return unauthorized();

    const { rows } = await sql`
      SELECT id, text, completed, source, created_at as "createdAt"
      FROM todos
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// 添加待办
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromToken(request.headers.get('authorization'));
    if (!userId) return unauthorized();

    const { text, source = 'web' } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO todos (user_id, text, source)
      VALUES (${userId}, ${text}, ${source})
      RETURNING id, text, completed, source, created_at as "createdAt"
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// 更新待办
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromToken(request.headers.get('authorization'));
    if (!userId) return unauthorized();

    const { id, completed } = await request.json();
    await sql`
      UPDATE todos SET completed = ${completed}
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// 删除待办
export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromToken(request.headers.get('authorization'));
    if (!userId) return unauthorized();

    const { id } = await request.json();
    await sql`DELETE FROM todos WHERE id = ${id} AND user_id = ${userId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
