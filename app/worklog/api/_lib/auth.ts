import { sql } from '@vercel/postgres';

export type AuthUser = {
  id: string;
  username: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.trim().split(/\s+/, 2);
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export async function findUserById(
  userId: string | null | undefined,
): Promise<AuthUser | null> {
  if (!userId || !isUuid(userId)) return null;
  const { rows } = await sql`
    SELECT id, username
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return (rows[0] as AuthUser | undefined) ?? null;
}

export async function getAuthUserFromHeader(
  authHeader: string | null,
): Promise<AuthUser | null> {
  return findUserById(getBearerToken(authHeader));
}

export async function getDefaultUser(): Promise<AuthUser | null> {
  const { rows } = await sql`
    SELECT id, username
    FROM users
    WHERE username = 'admin'
    LIMIT 1
  `;
  return (rows[0] as AuthUser | undefined) ?? null;
}
