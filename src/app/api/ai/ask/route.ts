import { NextRequest } from 'next/server';
import { z } from 'zod';
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
import { askMkulima } from '@/lib/services/ai';

const schema = z.object({
  farmId: z.string(),
  question: z.string().min(2),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse('farmId and question are required');

  const farm = await prisma.farm.findFirst({ where: { id: body.data.farmId, ownerId: session.sub } });
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

  const context = {
    crop: farm.crop,
    growth_stage: cropStage.stage,
    days_after_planting: cropStage.daysAfterPlanting,
    weather_today: weather.current,
    rainfall_last_30_days_mm: rainfall.last30DaysMm,
    rainfall_historical_average_mm: rainfall.historicalAverageMm,
    rainfall_status: rainfall.status,
    soil: soil.available
      ? {
          ph: soil.ph,
          organic_carbon_percent: soil.organicCarbonPercent,
          clay_percent: soil.clayPercent,
          ...(soil.approximated ? { approximated_from_km_away: soil.distanceKm } : {}),
        }
      : { available: false },
    nearest_market_price: market.nearest,
    market_trend: market.trend,
    national_production_context: nationalContext,
    decision_engine: decision,
  };

  const answer = await askMkulima(body.data.question, context);

  await prisma.aiMessage.createMany({
    data: [
      { farmId: farm.id, role: 'FARMER', content: body.data.question },
      { farmId: farm.id, role: 'MKULIMA', content: answer, context: JSON.parse(JSON.stringify(context)) },
    ],
  });

  return successResponse({ answer, context });
});
