import { type NextRequest, NextResponse } from 'next/server';

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

  // If pathname doesn't start with /fr, redirect to /fr-prefixed URL
  const pathnameHasLocale = pathname.startsWith('/fr/') || pathname === '/fr';

  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(`/fr${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  // Check auth cookie for protected routes (dashboard)
  const isProtectedRoute =
    pathname.startsWith('/fr/dashboard') ||
    pathname.startsWith('/fr/team') ||
    pathname.startsWith('/fr/settings');

  if (isProtectedRoute) {
    const authCookie = request.cookies.get('systm-auth');
    if (!authCookie?.value) {
      return NextResponse.redirect(
        new URL('/fr/login', request.url)
      );
    }
  }

  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
