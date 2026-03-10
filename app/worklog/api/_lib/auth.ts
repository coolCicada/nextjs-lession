import { sql } from '@vercel/postgres';

export type AuthUser = {
  id: string;
  username: string;
};

export function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.trim().split(/\s+/, 2);
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

export async function findUserById(
  userId: string | null | undefined,
): Promise<AuthUser | null> {
  if (!userId) return null;
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
