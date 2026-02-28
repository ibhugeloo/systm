import { type NextRequest, NextResponse } from 'next/server';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { i18n } from '@/lib/i18n-config';

const locales = i18n.locales;
const defaultLocale = i18n.defaultLocale;

function getLocale(request: NextRequest): string {
  const localeCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && locales.includes(localeCookie as typeof locales[number])) {
    return localeCookie;
  }

  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  try {
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    return matchLocale(languages, locales, defaultLocale);
  } catch {
    return defaultLocale;
  }
}

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

  const locale = getLocale(request);

  // If pathname doesn't start with locale, redirect to locale-prefixed URL
  const pathnameHasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!pathnameHasLocale) {
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    );
  }

  // Check auth cookie for protected routes (dashboard)
  const isProtectedRoute = locales.some(
    (l) => pathname.startsWith(`/${l}/dashboard`) || pathname.startsWith(`/${l}/team`) || pathname.startsWith(`/${l}/settings`)
  );

  if (isProtectedRoute) {
    const authCookie = request.cookies.get('systm-auth');
    if (!authCookie?.value) {
      const currentLocale = locales.find(
        (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
      ) || locale;
      return NextResponse.redirect(
        new URL(`/${currentLocale}/login`, request.url)
      );
    }
  }

  const response = NextResponse.next({ request: { headers: request.headers } });

  // Set locale cookie
  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 31536000,
    path: '/',
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
