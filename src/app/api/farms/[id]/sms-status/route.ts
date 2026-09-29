import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { getWeather } from '@/lib/services/weather';
import { getRainfallStatus } from '@/lib/services/rainfall';
import { getMarketSnapshot } from '@/lib/services/market';
import { getCropStage } from '@/lib/services/cropCalendar';
import { evaluateFarm } from '@/lib/services/decisionEngine';
import { sendSms } from '@/lib/services/sms';
import { CROP_LABELS } from '@/types/farm';

const STATUS_SW: Record<string, string> = {
  good: 'HALI NZURI',
  attention_required: 'ANGALIA',
  urgent: 'HARAKA',
};

/** Sends the farmer their own current farm status via SMS — only ever to their own declared number, on their own explicit request. */
export const POST = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub }, include: { owner: true } });
  if (!farm) return errorResponse('Farm not found', 404);
  if (!farm.owner.phone) return errorResponse('Add a phone number in Profile first', 400);

  const [weather, rainfall, market, cropStage] = await Promise.all([
    getWeather(farm.latitude, farm.longitude),
    getRainfallStatus(farm.latitude, farm.longitude),
    getMarketSnapshot(farm.crop, farm.latitude, farm.longitude),
    getCropStage(farm.crop, farm.plantingDate),
  ]);

  // Soil isn't needed for the overall status headline, keep this fast.
  const decision = evaluateFarm({
    weather,
    rainfall,
    soil: { available: false },
    market,
    cropStage,
  });

  const cropLabel = CROP_LABELS[farm.crop];
  const priceLine = market.nearest
    ? ` Bei: ${market.nearest.price.toLocaleString()} ${market.nearest.currency}/kg (${market.nearest.market}).`
    : '';

  const content =
    `Mkulima - ${farm.name}: ${STATUS_SW[decision.overallStatus]}. ` +
    `${cropLabel}, siku ${cropStage.daysAfterPlanting}. ` +
    `Hali ya hewa ${Math.round(weather.current.temperature)}C, mvua ${rainfall.status.replace(/_/g, ' ')}.${priceLine}`;

  const result = await sendSms(farm.owner.phone, content.slice(0, 459)); // stay within a few SMS segments
  if (!result.success) return errorResponse(result.message ?? 'Failed to send SMS', 502);

  return successResponse({ sent: true });
});
