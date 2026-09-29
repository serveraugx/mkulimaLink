import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getListingsForCrop } from '@/lib/services/listings';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const VALID_CROPS = ['MAIZE', 'RICE', 'CASSAVA', 'BEANS', 'TOMATO'] as const;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const crop = req.nextUrl.searchParams.get('crop') ?? 'MAIZE';
  if (!VALID_CROPS.includes(crop as (typeof VALID_CROPS)[number])) {
    return errorResponse('Invalid crop');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { latitude: true, longitude: true },
  });
  const buyerLocation =
    user?.latitude != null && user?.longitude != null ? { lat: user.latitude, lon: user.longitude } : undefined;

  const listings = await getListingsForCrop(crop as (typeof VALID_CROPS)[number], session.sub, buyerLocation);
  return successResponse({ crop, listings, hasLocation: !!buyerLocation });
});
