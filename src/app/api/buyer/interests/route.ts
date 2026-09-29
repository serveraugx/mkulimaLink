import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

/** This buyer's own sent interest requests, and their status. */
export const GET = withErrorHandler(async () => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'BUYER') return errorResponse('Only buyer accounts have sent requests', 403);

  const interests = await prisma.interest.findMany({
    where: { buyerId: session.sub },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        include: { farm: { include: { owner: { select: { name: true, phone: true, region: true } } } } },
      },
    },
  });

  return successResponse(
    interests.map((i) => ({
      id: i.id,
      status: i.status,
      createdAt: i.createdAt.toISOString(),
      listing: {
        quantityKg: i.listing.quantityKg,
        pricePerKg: i.listing.pricePerKg,
        currency: i.listing.currency,
        crop: i.listing.farm.crop,
        farmName: i.listing.farm.name,
        status: i.listing.status,
      },
      farmer: {
        name: i.listing.farm.owner.name,
        region: i.listing.farm.owner.region,
        // Contact info only revealed once the farmer has accepted.
        phone: i.status === 'ACCEPTED' ? i.listing.farm.owner.phone : null,
      },
    }))
  );
});
