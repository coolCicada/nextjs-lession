import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'unknown error';
}

// 初始化 todos + users 表
export async function GET() {
  try {
    // 用户表
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 默认账号
    const { rows } = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
    if (rows.length === 0) {
      await sql`
        INSERT INTO users (username, password_hash)
        VALUES ('admin', 'admin123')
      `;
    }

    // 待办表
    await sql`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        text VARCHAR(500) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        source VARCHAR(50) DEFAULT 'web',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 兼容旧表：补 user_id 列
    await sql`ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id UUID`;
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE constraint_name = 'todos_user_id_fkey'
        ) THEN
          ALTER TABLE todos
          ADD CONSTRAINT todos_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
      END
      $$;
    `;

    // 旧数据回填到 admin
    const admin = await sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`;
    if (admin.rows.length > 0) {
      const adminId = admin.rows[0].id;
      await sql`UPDATE todos SET user_id = ${adminId} WHERE user_id IS NULL`;
      await sql`ALTER TABLE todos ALTER COLUMN user_id SET NOT NULL`;
    }

    return NextResponse.json({ message: 'todos db initialized' });
  } catch (error) {
    // 忽略重复外键错误等可恢复情况
    const msg = getErrorMessage(error);
    if (msg.includes('already exists')) {
      return NextResponse.json({ message: 'todos db initialized' });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
