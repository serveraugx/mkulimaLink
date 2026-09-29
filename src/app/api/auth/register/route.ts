import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, signSession, sessionCookieOptions } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

// Admin accounts are provisioned via prisma/seed.ts, not self-registered.
const schema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['FARMER', 'BUYER']).default('FARMER'),
    phone: z.string().optional(),
    region: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine((data) => data.role !== 'FARMER' || (data.latitude !== undefined && data.longitude !== undefined), {
    message: 'Pin your farm location on the map to register as a farmer',
    path: ['latitude'],
  });

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse(body.error.issues[0]?.message ?? 'Invalid input');

  const existing = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (existing) return errorResponse('An account with this email already exists', 409);

  const user = await prisma.user.create({
    data: {
      name: body.data.name,
      email: body.data.email,
      passwordHash: await hashPassword(body.data.password),
      role: body.data.role,
      phone: body.data.phone,
      region: body.data.region,
      latitude: body.data.latitude,
      longitude: body.data.longitude,
    },
  });

  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  const res = successResponse(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      region: user.region,
      latitude: user.latitude,
      longitude: user.longitude,
    },
    201
  );
  res.cookies.set(sessionCookieOptions().name, token, sessionCookieOptions());
  return res;
});
