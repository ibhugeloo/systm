import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'systm-auth';

// Hardcoded admin user for local enterprise use
export const ADMIN_USER = {
  username: 'goat',
  password: 'superpass',
  profile: {
    id: 'local-admin-goat',
    email: 'goat@systm.re',
    full_name: 'Admin GOAT',
    role: 'admin' as const,
    avatar_url: null,
    created_at: new Date().toISOString(),
  },
};

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USER.username && password === ADMIN_USER.password;
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
  if (!authCookie?.value) return null;

  try {
    const session = JSON.parse(authCookie.value);
    if (session?.username === ADMIN_USER.username) {
      return {
        user: ADMIN_USER.profile,
      };
    }
  } catch {
    // Invalid cookie
  }
  return null;
}
