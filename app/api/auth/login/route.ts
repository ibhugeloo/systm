import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, validateCredentials } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const limiter = rateLimit(`login:${ip}`, { interval: 15 * 60 * 1000, maxRequests: 5 });

  if (!limiter.success) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(limiter.resetIn / 1000)) } }
    );
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email et mot de passe requis' },
      { status: 400 }
    );
  }

  const profile = await validateCredentials(email, password);

  if (!profile) {
    return NextResponse.json(
      { error: 'Identifiants invalides' },
      { status: 401 }
    );
  }

  // Log the login
  try {
    const supabase = await createClient();
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('login_logs').insert({
      user_id: profile.id,
      ip_address: ip,
      user_agent: userAgent,
    });
  } catch {
    // Non-blocking — don't fail login if log fails
  }

  const response = NextResponse.json({
    success: true,
    profile: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, JSON.stringify({
    userId: profile.id,
    email: profile.email,
  }), {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  });

  return response;
}
