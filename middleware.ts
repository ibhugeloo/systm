import { type NextRequest, NextResponse } from 'next/server';

const LOCALE = 'fr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files, _next, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(jpg|jpeg|png|gif|ico|svg|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // If pathname doesn't start with /fr, redirect
  if (!pathname.startsWith(`/${LOCALE}/`) && pathname !== `/${LOCALE}`) {
    return NextResponse.redirect(
      new URL(`/${LOCALE}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  const authCookie = request.cookies.get('systm-auth');
  let session: { userId: string; email: string } | null = null;

  if (authCookie?.value) {
    try {
      session = JSON.parse(authCookie.value);
    } catch {
      // Invalid cookie
    }
  }

  // Dashboard, settings, team routes → require auth (admin or team_member)
  const isDashboardRoute =
    pathname.startsWith(`/${LOCALE}/dashboard`) ||
    pathname.startsWith(`/${LOCALE}/team`) ||
    pathname.startsWith(`/${LOCALE}/settings`);

  // Portal routes → require auth (any role, client identified by profile)
  const isPortalRoute = pathname.startsWith(`/${LOCALE}/portal`);

  if (isDashboardRoute && !session) {
    return NextResponse.redirect(
      new URL(`/${LOCALE}/login`, request.url)
    );
  }

  if (isPortalRoute && !session) {
    return NextResponse.redirect(
      new URL(`/${LOCALE}/login`, request.url)
    );
  }

  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
