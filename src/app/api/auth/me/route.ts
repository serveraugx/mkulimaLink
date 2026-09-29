import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const updateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  region: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const GET = withErrorHandler(async () => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      region: true,
      latitude: true,
      longitude: true,
    },
  });
  if (!user) return errorResponse('Not authenticated', 401);

  return successResponse(user);
});

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) return errorResponse(body.error.issues[0]?.message ?? 'Invalid input');

  const user = await prisma.user.update({
    where: { id: session.sub },
    data: body.data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      region: true,
      latitude: true,
      longitude: true,
    },
  });

  return successResponse(user);
});
