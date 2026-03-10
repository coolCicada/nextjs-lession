import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { getAuthUserFromHeader } from '../_lib/auth';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

// GET - 获取当前用户的任务
export async function GET(request: Request) {
  try {
    const user = await getAuthUserFromHeader(
      request.headers.get('authorization'),
    );
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { rows } = await sql`
      SELECT
        id,
        title,
        detail,
        source,
        schedule_text as "scheduleText",
        status,
        next_run_at as "nextRunAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM chat_tasks
      WHERE user_id = ${user.id}
      ORDER BY COALESCE(next_run_at, created_at) DESC
      LIMIT 300
    `;

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

// POST - 创建任务（需要登录或飞书同步）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      detail = '',
      source = 'feishu',
      scheduleText = '',
      status = 'active',
      nextRunAt = null,
    } = body || {};

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const user = await getAuthUserFromHeader(
      request.headers.get('authorization'),
    );
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { rows } = await sql`
      INSERT INTO chat_tasks (user_id, title, detail, source, schedule_text, status, next_run_at)
      VALUES (${user.id}, ${title}, ${detail}, ${source}, ${scheduleText}, ${status}, ${nextRunAt ? new Date(nextRunAt).toISOString() : null})
      RETURNING
        id,
        title,
        detail,
        source,
        schedule_text as "scheduleText",
        status,
        next_run_at as "nextRunAt",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

// PUT - 更新任务
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, title, detail, scheduleText, nextRunAt } = body || {};

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const user = await getAuthUserFromHeader(
      request.headers.get('authorization'),
    );
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { rowCount } = await sql`
      UPDATE chat_tasks
      SET
        status = COALESCE(${status}, status),
        title = COALESCE(${title}, title),
        detail = COALESCE(${detail}, detail),
        schedule_text = COALESCE(${scheduleText}, schedule_text),
        next_run_at = COALESCE(${nextRunAt ? new Date(nextRunAt).toISOString() : null}, next_run_at),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    if (!rowCount) {
      return NextResponse.json({ error: 'task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

// DELETE - 删除任务
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const user = await getAuthUserFromHeader(
      request.headers.get('authorization'),
    );
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { rowCount } =
      await sql`DELETE FROM chat_tasks WHERE id = ${id} AND user_id = ${user.id}`;
    if (!rowCount) {
      return NextResponse.json({ error: 'task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
