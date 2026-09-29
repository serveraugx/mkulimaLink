import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { sendSms } from '@/lib/services/sms';
import { CROP_LABELS } from '@/types/farm';

const schema = z.object({ message: z.string().max(500).optional() });

export const POST = withErrorHandler(async (req: NextRequest, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'BUYER') return errorResponse('Only buyer accounts can send interest requests', 403);

  const listing = await prisma.listing.findFirst({
    where: { id: params.id, status: 'ACTIVE' },
    include: { farm: { include: { owner: { select: { name: true, phone: true } } } } },
  });
  if (!listing) return errorResponse('Listing not found or no longer active', 404);

  const body = schema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return errorResponse('Invalid input');

  // Idempotent — resending doesn't create a duplicate or reset an existing decision.
  const existing = await prisma.interest.findUnique({
    where: { listingId_buyerId: { listingId: listing.id, buyerId: session.sub } },
  });
  if (existing) return successResponse(existing);

  const interest = await prisma.interest.create({
    data: { listingId: listing.id, buyerId: session.sub, message: body.data.message },
  });

  // Best-effort SMS to the farmer — failure never blocks the request itself.
  if (listing.farm.owner.phone) {
    const buyer = await prisma.user.findUnique({ where: { id: session.sub }, select: { name: true } });
    const cropLabel = CROP_LABELS[listing.farm.crop as keyof typeof CROP_LABELS] ?? listing.farm.crop;
    try {
      await sendSms(
        listing.farm.owner.phone,
        `Mkulima: ${buyer?.name ?? 'Mnunuzi'} anataka kununua ${listing.quantityKg}kg ${cropLabel} kutoka ${listing.farm.name}. Fungua Mkulima kuona ombi na kulikubali.`
      );
    } catch {
      /* SMS is best-effort */
    }
  }

  return successResponse(interest, 201);
});
