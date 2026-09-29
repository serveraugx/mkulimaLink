import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { sendSms } from '@/lib/services/sms';
import { CROP_LABELS } from '@/types/farm';

const schema = z.object({ status: z.enum(['ACCEPTED', 'DECLINED']) });

export const PATCH = withErrorHandler(async (req: NextRequest, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const interest = await prisma.interest.findFirst({
    where: { id: params.id, listing: { farm: { ownerId: session.sub } } },
    include: {
      buyer: { select: { name: true, phone: true } },
      listing: { include: { farm: { select: { name: true, crop: true, owner: { select: { name: true, phone: true } } } } } },
    },
  });
  if (!interest) return errorResponse('Interest request not found', 404);

  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse('Invalid status');

  const updated = await prisma.interest.update({
    where: { id: interest.id },
    data: { status: body.data.status },
  });

  // Best-effort SMS to the buyer when accepted — failure never blocks the request.
  if (body.data.status === 'ACCEPTED' && interest.buyer.phone) {
    const cropLabel = CROP_LABELS[interest.listing.farm.crop as keyof typeof CROP_LABELS] ?? interest.listing.farm.crop;
    const farmerPhone = interest.listing.farm.owner.phone ? ` Piga simu: ${interest.listing.farm.owner.phone}` : '';
    try {
      await sendSms(
        interest.buyer.phone,
        `Mkulima: ${interest.listing.farm.owner.name} amekubali ombi lako la ${cropLabel} kutoka ${interest.listing.farm.name}.${farmerPhone}`
      );
    } catch {
      /* SMS is best-effort */
    }
  }

  return successResponse(updated);
});
