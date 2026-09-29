import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

export const GET = withErrorHandler(async () => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'ADMIN') return errorResponse('Forbidden', 403);

  const [listings, interests] = await Promise.all([
    prisma.listing.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        farm: { select: { name: true, crop: true, owner: { select: { name: true, email: true } } } },
        _count: { select: { interests: true } },
      },
    }),
    prisma.interest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        buyer: { select: { name: true, email: true } },
        listing: { select: { farm: { select: { name: true, crop: true, owner: { select: { name: true } } } } } },
      },
    }),
  ]);

  return successResponse({
    listings: listings.map((l) => ({
      id: l.id,
      farmName: l.farm.name,
      crop: l.farm.crop,
      ownerName: l.farm.owner.name,
      ownerEmail: l.farm.owner.email,
      quantityKg: l.quantityKg,
      pricePerKg: l.pricePerKg,
      currency: l.currency,
      status: l.status,
      interestCount: l._count.interests,
      updatedAt: l.updatedAt.toISOString(),
    })),
    interests: interests.map((i) => ({
      id: i.id,
      status: i.status,
      buyerName: i.buyer.name,
      buyerEmail: i.buyer.email,
      farmerName: i.listing.farm.owner.name,
      farmName: i.listing.farm.name,
      crop: i.listing.farm.crop,
      createdAt: i.createdAt.toISOString(),
    })),
  });
});
