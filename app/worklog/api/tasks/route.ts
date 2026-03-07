import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT
        id,
        title,
        detail,
        source,
        schedule_text as "scheduleText",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM chat_tasks
      ORDER BY created_at DESC
      LIMIT 300
    `;

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      detail = '',
      source = 'feishu',
      scheduleText = '',
      status = 'active',
    } = body || {};

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO chat_tasks (title, detail, source, schedule_text, status)
      VALUES (${title}, ${detail}, ${source}, ${scheduleText}, ${status})
      RETURNING
        id,
        title,
        detail,
        source,
        schedule_text as "scheduleText",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, title, detail, scheduleText } = body || {};

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await sql`
      UPDATE chat_tasks
      SET
        status = COALESCE(${status}, status),
        title = COALESCE(${title}, title),
        detail = COALESCE(${detail}, detail),
        schedule_text = COALESCE(${scheduleText}, schedule_text),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await sql`DELETE FROM chat_tasks WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
