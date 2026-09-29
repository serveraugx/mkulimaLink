import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * JWT/cookie session handling only — no bcrypt. Kept separate from auth.ts
 * so Edge Middleware (src/middleware.ts) doesn't bundle bcryptjs, which
 * uses Node APIs unavailable in the Edge runtime.
 */

const COOKIE_NAME = 'token';
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-only-change-me');

export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN';

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

/** Where each role lands after login, and the route prefix middleware guards for it. */
export const ROLE_HOME: Record<UserRole, string> = {
  FARMER: '/dashboard',
  BUYER: '/buyer',
  ADMIN: '/admin',
};

export function sessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  };
}

/** Reads and verifies the session cookie from an incoming server-side request. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export { COOKIE_NAME };
