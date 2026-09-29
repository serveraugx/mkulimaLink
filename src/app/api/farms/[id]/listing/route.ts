import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const schema = z.object({
  quantityKg: z.number().positive(),
  pricePerKg: z.number().positive(),
  status: z.enum(['ACTIVE', 'SOLD_OUT', 'CLOSED']).default('ACTIVE'),
});

export const GET = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  const listing = await prisma.listing.findUnique({ where: { farmId: farm.id } });
  return successResponse(listing);
});

/** Create or update this farm's listing (there's only ever one — farmers edit it in place). */
export const PUT = withErrorHandler(async (req: NextRequest, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'FARMER') return errorResponse('Only farmer accounts can list produce', 403);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse(body.error.issues[0]?.message ?? 'Invalid input');

  const listing = await prisma.listing.upsert({
    where: { farmId: farm.id },
    update: body.data,
    create: { ...body.data, farmId: farm.id },
  });

  return successResponse(listing);
});
