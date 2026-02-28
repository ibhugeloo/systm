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

  // Check auth cookie for protected routes
  const isProtectedRoute =
    pathname.startsWith(`/${LOCALE}/dashboard`) ||
    pathname.startsWith(`/${LOCALE}/team`) ||
    pathname.startsWith(`/${LOCALE}/settings`);

  if (isProtectedRoute) {
    const authCookie = request.cookies.get('systm-auth');
    if (!authCookie?.value) {
      return NextResponse.redirect(
        new URL(`/${LOCALE}/login`, request.url)
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
