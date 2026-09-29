import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Re-exported so existing API route imports (`from '@/lib/auth'`) keep working —
// the JWT/cookie logic itself lives in session.ts, which Edge Middleware imports
// directly to avoid bundling bcrypt.
export * from './session';
