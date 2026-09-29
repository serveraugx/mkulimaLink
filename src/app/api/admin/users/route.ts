import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const VALID_ROLES = ['FARMER', 'BUYER', 'ADMIN'] as const;

export const GET = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'ADMIN') return errorResponse('Forbidden', 403);

  const roleParam = req.nextUrl.searchParams.get('role');
  const role = roleParam && VALID_ROLES.includes(roleParam as (typeof VALID_ROLES)[number]) ? roleParam : undefined;
  const q = req.nextUrl.searchParams.get('q')?.trim();

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as (typeof VALID_ROLES)[number] } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      region: true,
      createdAt: true,
      _count: { select: { farms: true, interests: true } },
    },
  });

  return successResponse(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      region: u.region,
      createdAt: u.createdAt.toISOString(),
      farmCount: u._count.farms,
      interestsSent: u._count.interests,
    }))
  );
});
