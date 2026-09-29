import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const updateSchema = z.object({
  name: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  sizeHectares: z.number().positive(),
  crop: z.enum(['MAIZE', 'RICE', 'CASSAVA', 'BEANS', 'TOMATO']),
  plantingDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
});

export const GET = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  return successResponse(farm);
});

export const PATCH = withErrorHandler(async (req: NextRequest, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const existing = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!existing) return errorResponse('Farm not found', 404);

  const body = updateSchema.safeParse(await req.json());
  if (!body.success) return errorResponse(body.error.issues[0]?.message ?? 'Invalid input');

  const farm = await prisma.farm.update({
    where: { id: existing.id },
    data: { ...body.data, plantingDate: new Date(body.data.plantingDate) },
  });

  return successResponse(farm);
});

export const DELETE = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  await prisma.farm.delete({ where: { id: farm.id } });
  return successResponse({ deleted: true });
});
