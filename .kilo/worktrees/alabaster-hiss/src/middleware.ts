import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware
 *
 * Protects all routes under /dashboard by checking for a valid auth token.
 * Unauthenticated users are redirected to /login.
 *
 * Note: In a real app, replace the token check with NextAuth session validation
 *       or your own JWT verification logic.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookies
  const token = request.cookies.get('token')?.value;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Only run middleware on these paths.
   * Excludes static files and internal Next.js routes.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
