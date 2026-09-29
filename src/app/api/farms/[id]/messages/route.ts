import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

export const GET = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  const messages = await prisma.aiMessage.findMany({
    where: { farmId: farm.id },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  return successResponse(messages);
});
