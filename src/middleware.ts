import { NextRequest, NextResponse } from 'next/server';
import { verifySession, ROLE_HOME, type UserRole } from '@/lib/session';

/**
 * Edge Middleware — role-based route guard.
 *
 * /dashboard/*  -> FARMER only
 * /buyer/*      -> BUYER only
 * /admin/*      -> ADMIN only
 *
 * A signed-in user hitting the wrong section is redirected to their own
 * home instead of getting a 404/blank page; an unauthenticated user is sent
 * to /login. Authenticated users are also kept off /login and /register.
 */
const ROLE_PREFIXES: Record<string, UserRole> = {
  '/dashboard': 'FARMER',
  '/buyer': 'BUYER',
  '/admin': 'ADMIN',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const session = token ? await verifySession(token) : null;

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((p) => pathname.startsWith(p));

  if (matchedPrefix) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== ROLE_PREFIXES[matchedPrefix]) {
      return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
    }
  }

  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
