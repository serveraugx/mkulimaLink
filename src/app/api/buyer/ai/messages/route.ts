import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const VALID_CROPS = ['MAIZE', 'RICE', 'CASSAVA', 'BEANS', 'TOMATO'] as const;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const crop = req.nextUrl.searchParams.get('crop');
  if (!crop || !VALID_CROPS.includes(crop as (typeof VALID_CROPS)[number])) {
    return errorResponse('A valid crop is required');
  }

  const messages = await prisma.buyerAiMessage.findMany({
    where: { buyerId: session.sub, crop: crop as (typeof VALID_CROPS)[number] },
    orderBy: { createdAt: 'asc' },
    take: 50,
  });

  return successResponse(messages);
});
