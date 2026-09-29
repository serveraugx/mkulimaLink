import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const schema = z.object({ active: z.boolean() });

export const PATCH = withErrorHandler(async (req: NextRequest, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const alert = await prisma.priceAlert.findFirst({ where: { id: params.id, buyerId: session.sub } });
  if (!alert) return errorResponse('Alert not found', 404);

  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse('Invalid input');

  const updated = await prisma.priceAlert.update({ where: { id: alert.id }, data: body.data });
  return successResponse(updated);
});

export const DELETE = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const alert = await prisma.priceAlert.findFirst({ where: { id: params.id, buyerId: session.sub } });
  if (!alert) return errorResponse('Alert not found', 404);

  await prisma.priceAlert.delete({ where: { id: alert.id } });
  return successResponse({ deleted: true });
});
