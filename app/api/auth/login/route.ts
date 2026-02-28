import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, validateCredentials } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!validateCredentials(username, password)) {
    return NextResponse.json(
      { error: 'Identifiants invalides' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify({ username }), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  });

  return response;
}
