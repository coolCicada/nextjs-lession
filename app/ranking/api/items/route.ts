import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

// GET - 获取排行榜
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT
        id,
        name,
        score,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM ranking_items
      ORDER BY score DESC
      LIMIT 500
    `;

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// POST - 添加条目
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, score } = body || {};

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (typeof score !== 'number' || isNaN(score)) {
      return NextResponse.json({ error: 'score must be a number' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO ranking_items (name, score)
      VALUES (${name}, ${score})
      RETURNING
        id,
        name,
        score,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// PUT - 更新分数
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, score, name } = body || {};

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await sql`
      UPDATE ranking_items
      SET
        score = COALESCE(${score}, score),
        name = COALESCE(${name}, name),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

// DELETE - 删除条目
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await sql`DELETE FROM ranking_items WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
