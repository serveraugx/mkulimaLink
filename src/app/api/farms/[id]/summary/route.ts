import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { getWeather } from '@/lib/services/weather';
import { getRainfallStatus } from '@/lib/services/rainfall';
import { getSoilProfile } from '@/lib/services/soil';
import { getCropStage } from '@/lib/services/cropCalendar';
import { getMarketSnapshot } from '@/lib/services/market';
import { getNationalCropContext } from '@/lib/services/nationalCropStat';
import { evaluateFarm } from '@/lib/services/decisionEngine';

/**
 * Aggregates all six intelligence modules for one farm in a single call —
 * this is what powers the "My Farm" screen. External calls that fail
 * independently (e.g. SoilGrids) don't take down the whole page.
 */
export const GET = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  const [weather, rainfall, soil, cropStage, market, nationalContext] = await Promise.all([
    getWeather(farm.latitude, farm.longitude),
    getRainfallStatus(farm.latitude, farm.longitude),
    getSoilProfile(farm.latitude, farm.longitude),
    getCropStage(farm.crop, farm.plantingDate),
    getMarketSnapshot(farm.crop, farm.latitude, farm.longitude),
    getNationalCropContext(farm.crop),
  ]);

  const decision = evaluateFarm({ weather, rainfall, soil, market, cropStage });

  return successResponse({ farm, weather, rainfall, soil, cropStage, market, nationalContext, decision });
});
