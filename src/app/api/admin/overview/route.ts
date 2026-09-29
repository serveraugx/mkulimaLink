import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

export const GET = withErrorHandler(async () => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'ADMIN') return errorResponse('Forbidden', 403);

  const [farmerCount, buyerCount, farmCount, latestMarketRow, cropBreakdown, recentFarms, activeListings, pendingInterests] =
    await Promise.all([
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.farm.count(),
      prisma.marketPrice.findFirst({ orderBy: { date: 'desc' }, select: { date: true, source: true } }),
      prisma.farm.groupBy({ by: ['crop'], _count: { crop: true } }),
      prisma.farm.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { owner: { select: { name: true, email: true, region: true } } },
      }),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.interest.count({ where: { status: 'PENDING' } }),
    ]);

  const [marketPriceCount, nationalStatCount] = await Promise.all([
    prisma.marketPrice.count(),
    prisma.nationalCropStat.count(),
  ]);

  return successResponse({
    users: { farmers: farmerCount, buyers: buyerCount },
    marketplace: { activeListings, pendingInterests },
    farms: {
      total: farmCount,
      byCrop: cropBreakdown.map((c) => ({ crop: c.crop, count: c._count.crop })),
    },
    dataFreshness: {
      marketPriceRows: marketPriceCount,
      nationalStatRows: nationalStatCount,
      latestMarketDataDate: latestMarketRow?.date.toISOString().slice(0, 10) ?? null,
      latestMarketDataSource: latestMarketRow?.source ?? null,
    },
    recentFarms: recentFarms.map((f) => ({
      id: f.id,
      name: f.name,
      crop: f.crop,
      sizeHectares: f.sizeHectares,
      region: f.owner.region,
      ownerName: f.owner.name,
      ownerEmail: f.owner.email,
      createdAt: f.createdAt.toISOString(),
    })),
  });
});
