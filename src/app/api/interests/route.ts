import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

/** Incoming buyer interest requests across all of this farmer's listings. */
export const GET = withErrorHandler(async () => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'FARMER') return errorResponse('Only farmer accounts have an interests inbox', 403);

  const interests = await prisma.interest.findMany({
    where: { listing: { farm: { ownerId: session.sub } } },
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: { select: { name: true, phone: true, region: true } },
      listing: { include: { farm: { select: { id: true, name: true, crop: true } } } },
    },
  });

  return successResponse(
    interests.map((i) => ({
      id: i.id,
      status: i.status,
      message: i.message,
      createdAt: i.createdAt.toISOString(),
      buyer: {
        name: i.buyer.name,
        region: i.buyer.region,
        // Contact info only revealed once the farmer has accepted.
        phone: i.status === 'ACCEPTED' ? i.buyer.phone : null,
      },
      listing: {
        id: i.listingId,
        quantityKg: i.listing.quantityKg,
        pricePerKg: i.listing.pricePerKg,
        currency: i.listing.currency,
        farmId: i.listing.farm.id,
        farmName: i.listing.farm.name,
        crop: i.listing.farm.crop,
      },
    }))
  );
});
