import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { getMarketOverview } from '@/lib/services/market';
import { getListingsForCrop } from '@/lib/services/listings';
import { getNationalCropContext } from '@/lib/services/nationalCropStat';
import { askMkulima } from '@/lib/services/ai';

const VALID_CROPS = ['MAIZE', 'RICE', 'CASSAVA', 'BEANS', 'TOMATO'] as const;
const schema = z.object({
  crop: z.enum(VALID_CROPS),
  question: z.string().min(2),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'BUYER') return errorResponse('Only buyer accounts use this assistant', 403);

  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse(body.error.issues[0]?.message ?? 'crop and question are required');
  const { crop, question } = body.data;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { latitude: true, longitude: true },
  });
  const buyerLocation =
    user?.latitude != null && user?.longitude != null ? { lat: user.latitude, lon: user.longitude } : undefined;

  const [marketRows, listings, nationalContext] = await Promise.all([
    getMarketOverview(crop, buyerLocation),
    getListingsForCrop(crop, session.sub, buyerLocation),
    getNationalCropContext(crop),
  ]);

  const cheapestMarkets = [...marketRows].sort((a, b) => a.price - b.price).slice(0, 5);

  const context = {
    crop,
    cheapest_reference_markets: cheapestMarkets.map((m) => ({
      market: m.market,
      region: m.region,
      distance_km: m.distanceKm,
      price_per_kg: m.price,
      currency: m.currency,
      price_type: m.priceType,
      date: m.date,
      trend: m.trend,
    })),
    farmers_currently_selling: listings.map((l) => ({
      farmer: l.farmerName,
      farm: l.farmName,
      distance_km: l.distanceKm,
      quantity_kg: l.quantityKg,
      price_per_kg: l.pricePerKg,
      currency: l.currency,
    })),
    national_production_context: nationalContext,
  };

  const answer = await askMkulima(question, context, 'buyer');

  await prisma.buyerAiMessage.createMany({
    data: [
      { buyerId: session.sub, crop, role: 'BUYER', content: question },
      {
        buyerId: session.sub,
        crop,
        role: 'MKULIMA',
        content: answer,
        context: JSON.parse(JSON.stringify(context)),
      },
    ],
  });

  return successResponse({ answer, context });
});
