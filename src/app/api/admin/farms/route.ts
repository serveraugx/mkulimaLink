import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'ADMIN') return errorResponse('Forbidden', 403);

  const q = req.nextUrl.searchParams.get('q')?.trim();

  const farms = await prisma.farm.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { owner: { name: { contains: q, mode: 'insensitive' } } },
            { owner: { email: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: { select: { name: true, email: true, region: true } },
      listing: { select: { status: true, quantityKg: true, pricePerKg: true, currency: true } },
    },
  });

  return successResponse(
    farms.map((f) => ({
      id: f.id,
      name: f.name,
      crop: f.crop,
      sizeHectares: f.sizeHectares,
      latitude: f.latitude,
      longitude: f.longitude,
      plantingDate: f.plantingDate.toISOString(),
      createdAt: f.createdAt.toISOString(),
      owner: { name: f.owner.name, email: f.owner.email, region: f.owner.region },
      listing: f.listing,
    }))
  );
});
