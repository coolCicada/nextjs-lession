'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  PINGPONG_REGISTRANT_COOKIE,
  PINGPONG_SESSION_COOKIE,
  buildRegistrantKey,
  deletePingPongSession,
  getPingPongSessionMaxAge,
  getPingPongUserBySessionToken,
  loginPingPongUser,
  registerPingPongUser,
  upsertTournamentRegistration,
} from '@/app/pingpong/_lib/db';

const RegistrationSchema = z.object({
  playerName: z.string().trim().max(100).optional().default(''),
  city: z.string().trim().max(160).optional().default(''),
  note: z.string().trim().max(400).optional().default(''),
});

const RegisterUserSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    city: z.string().trim().min(1).max(160),
    club: z.string().trim().max(160).optional().default(''),
    email: z
      .union([z.literal(''), z.string().trim().email().max(160)])
      .optional()
      .default(''),
    phone: z
      .union([z.literal(''), z.string().trim().min(6).max(40)])
      .optional()
      .default(''),
  })
  .refine((value) => value.email || value.phone, {
    message: 'identifier-required',
    path: ['email'],
  });

const LoginUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  identifier: z.string().trim().min(1).max(160),
});

function buildAuthRedirect(params: Record<string, string>) {
  return `/pingpong/auth?${new URLSearchParams(params).toString()}`;
}

function setPingPongRegistrantCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  name: string,
  city: string,
) {
  cookieStore.set(PINGPONG_REGISTRANT_COOKIE, buildRegistrantKey(name, city), {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });
}

function setPingPongSessionCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  sessionToken: string,
) {
  cookieStore.set(PINGPONG_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: getPingPongSessionMaxAge(),
    path: '/',
  });
}

export async function registerPingPongAccount(formData: FormData) {
  const parsed = RegisterUserSchema.safeParse({
    name: formData.get('name'),
    city: formData.get('city'),
    club: formData.get('club'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  });

  if (!parsed.success) {
    const code = parsed.error.issues.some(
      (issue) => issue.message === 'identifier-required',
    )
      ? 'identifier_required'
      : 'invalid_profile';
    redirect(buildAuthRedirect({ mode: 'register', error: code }));
  }

  const result = await registerPingPongUser(parsed.data);
  if (!result.ok) {
    redirect(buildAuthRedirect({ mode: 'register', error: result.code }));
  }

  const cookieStore = await cookies();
  setPingPongSessionCookie(cookieStore, result.sessionToken);
  setPingPongRegistrantCookie(cookieStore, result.user.name, result.user.city);

  revalidatePath('/pingpong');
  revalidatePath('/pingpong/auth');
  revalidatePath('/pingpong/me');
  redirect('/pingpong/me?welcome=1');
}

export async function loginPingPongAccount(formData: FormData) {
  const parsed = LoginUserSchema.safeParse({
    name: formData.get('name'),
    identifier: formData.get('identifier'),
  });

  if (!parsed.success) {
    redirect(buildAuthRedirect({ mode: 'login', error: 'invalid_login' }));
  }

  const result = await loginPingPongUser(parsed.data);
  if (!result.ok) {
    redirect(buildAuthRedirect({ mode: 'login', error: result.code }));
  }

  const cookieStore = await cookies();
  setPingPongSessionCookie(cookieStore, result.sessionToken);
  setPingPongRegistrantCookie(cookieStore, result.user.name, result.user.city);

  revalidatePath('/pingpong');
  revalidatePath('/pingpong/auth');
  revalidatePath('/pingpong/me');
  redirect('/pingpong/me');
}

export async function logoutPingPongAccount() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(PINGPONG_SESSION_COOKIE)?.value;

  await deletePingPongSession(sessionToken);

  cookieStore.delete(PINGPONG_SESSION_COOKIE);

  revalidatePath('/pingpong');
  revalidatePath('/pingpong/auth');
  revalidatePath('/pingpong/me');
  redirect('/pingpong/auth?logged_out=1');
}

export async function registerForTournament(
  tournamentId: string,
  formData: FormData,
) {
  const values = RegistrationSchema.parse({
    playerName: formData.get('playerName'),
    city: formData.get('city'),
    note: formData.get('note'),
  });

  const cookieStore = await cookies();
  const currentUser = await getPingPongUserBySessionToken(
    cookieStore.get(PINGPONG_SESSION_COOKIE)?.value,
  );
  const playerName = currentUser?.name ?? values.playerName;
  const city = currentUser?.city ?? values.city;

  if (!playerName || !city) {
    redirect('/pingpong/auth?from=tournament&error=profile_required');
  }

  await upsertTournamentRegistration({
    tournamentId,
    pingPongUserId: currentUser?.id,
    playerName,
    city,
    note: values.note,
  });

  setPingPongRegistrantCookie(cookieStore, playerName, city);

  revalidatePath('/pingpong');
  revalidatePath('/pingpong/me');
  revalidatePath('/pingpong/players');
  revalidatePath(`/pingpong/tournaments/${tournamentId}`);
  redirect(`/pingpong/tournaments/${tournamentId}?registered=1`);
}
