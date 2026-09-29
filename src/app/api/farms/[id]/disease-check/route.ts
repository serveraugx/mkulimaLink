import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { checkPlantPhoto } from '@/lib/services/visionAi';
import { CROP_LABELS } from '@/types/farm';

const schema = z.object({
  imageBase64: z.string().min(100),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

// Client resizes before upload, but reject anything wildly oversized outright.
const MAX_BASE64_LENGTH = 8_000_000; // ~6MB decoded

export const POST = withErrorHandler(async (req: NextRequest, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse('A photo is required');
  if (body.data.imageBase64.length > MAX_BASE64_LENGTH) return errorResponse('Image too large');

  const cropLabel = CROP_LABELS[farm.crop];
  const result = await checkPlantPhoto(body.data.imageBase64, body.data.mimeType, cropLabel);

  if (result.available && result.assessment) {
    await prisma.aiMessage.createMany({
      data: [
        { farmId: farm.id, role: 'FARMER', content: '[Alituma picha ya mmea kwa uchambuzi]' },
        {
          farmId: farm.id,
          role: 'MKULIMA',
          content: result.assessment,
          context: { type: 'disease_check' },
        },
      ],
    });
  }

  return successResponse(result);
});
