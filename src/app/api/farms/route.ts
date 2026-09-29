import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const schema = z.object({
  name: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  sizeHectares: z.number().positive(),
  crop: z.enum(['MAIZE', 'RICE', 'CASSAVA', 'BEANS', 'TOMATO']),
  plantingDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
});

export const GET = withErrorHandler(async () => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farms = await prisma.farm.findMany({
    where: { ownerId: session.sub },
    orderBy: { createdAt: 'desc' },
  });
  return successResponse(farms);
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'FARMER') return errorResponse('Only farmer accounts can register a farm', 403);

  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse(body.error.issues[0]?.message ?? 'Invalid input');

  const farm = await prisma.farm.create({
    data: {
      ...body.data,
      plantingDate: new Date(body.data.plantingDate),
      ownerId: session.sub,
    },
  });

  return successResponse(farm, 201);
});
