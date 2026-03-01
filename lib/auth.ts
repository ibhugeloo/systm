import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types/database';

export const AUTH_COOKIE_NAME = 'systm-auth';

interface SessionData {
  userId: string;
  email: string;
}

export async function validateCredentials(
  email: string,
  password: string
): Promise<Profile | null> {
  const bcrypt = await import('bcryptjs');
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !profile || !profile.password_hash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, profile.password_hash);
  if (!isValid) {
    return null;
  }

  return profile as Profile;
}

export async function getAuthSession(): Promise<{ user: Profile } | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (!authCookie?.value) return null;

  try {
    const session: SessionData = JSON.parse(authCookie.value);
    if (!session?.userId) return null;

    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.userId)
      .single();

    if (error || !profile) return null;

    return { user: profile as Profile };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}
