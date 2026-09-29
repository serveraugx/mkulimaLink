import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { getWeather } from '@/lib/services/weather';
import { getRainfallStatus } from '@/lib/services/rainfall';
import { evaluateWeatherRisk } from '@/lib/services/decisionEngine';

/** Cheap risk status (weather + rainfall only) for showing a badge per farm on a list view. */
export const GET = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  const [weather, rainfall] = await Promise.all([
    getWeather(farm.latitude, farm.longitude),
    getRainfallStatus(farm.latitude, farm.longitude),
  ]);

  const { weatherRisk, droughtRisk, overallStatus } = evaluateWeatherRisk(weather, rainfall);
  return successResponse({ weatherRisk, droughtRisk, overallStatus });
});
