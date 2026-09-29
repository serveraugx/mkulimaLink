import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signSession, sessionCookieOptions } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse('Email and password are required');

  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (!user || !(await verifyPassword(body.data.password, user.passwordHash))) {
    return errorResponse('Invalid email or password', 401);
  }

  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  const res = successResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    region: user.region,
    latitude: user.latitude,
    longitude: user.longitude,
  });
  res.cookies.set(sessionCookieOptions().name, token, sessionCookieOptions());
  return res;
});
