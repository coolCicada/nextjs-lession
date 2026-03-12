'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  PINGPONG_REGISTRANT_COOKIE,
  buildRegistrantKey,
  upsertTournamentRegistration,
} from '@/app/pingpong/_lib/db';

const RegistrationSchema = z.object({
  playerName: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(160),
  note: z.string().trim().max(400).optional().default(''),
});

export async function registerForTournament(
  tournamentId: string,
  formData: FormData,
) {
  const values = RegistrationSchema.parse({
    playerName: formData.get('playerName'),
    city: formData.get('city'),
    note: formData.get('note'),
  });

  await upsertTournamentRegistration({
    tournamentId,
    playerName: values.playerName,
    city: values.city,
    note: values.note,
  });

  cookies().set(PINGPONG_REGISTRANT_COOKIE, buildRegistrantKey(values.playerName, values.city), {
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  revalidatePath('/pingpong');
  revalidatePath('/pingpong/me');
  revalidatePath('/pingpong/players');
  revalidatePath(`/pingpong/tournaments/${tournamentId}`);
  redirect(`/pingpong/tournaments/${tournamentId}?registered=1`);
}
