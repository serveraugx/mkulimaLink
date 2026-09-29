import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMarketOverview } from '@/lib/services/market';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

const VALID_CROPS = ['MAIZE', 'RICE', 'CASSAVA', 'BEANS', 'TOMATO'] as const;
const schema = z.object({
  crop: z.enum(VALID_CROPS),
  targetPrice: z.number().positive(),
  direction: z.enum(['BELOW', 'ABOVE']),
});

/**
 * Lists the buyer's price alerts with live "triggered" status computed
 * against real market data right now — there's no background job or
 * push/SMS channel, so this is checked whenever the buyer looks, not
 * delivered to them proactively.
 */
export const GET = withErrorHandler(async () => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'BUYER') return errorResponse('Only buyer accounts have price alerts', 403);

  const alerts = await prisma.priceAlert.findMany({
    where: { buyerId: session.sub },
    orderBy: { createdAt: 'desc' },
  });

  const cheapestByCrop = new Map<string, { price: number; market: string; currency: string } | null>();
  for (const crop of new Set(alerts.map((a) => a.crop))) {
    const rows = await getMarketOverview(crop);
    const cheapest = rows.length > 0 ? [...rows].sort((a, b) => a.price - b.price)[0] : null;
    cheapestByCrop.set(crop, cheapest ? { price: cheapest.price, market: cheapest.market, currency: cheapest.currency } : null);
  }

  return successResponse(
    alerts.map((a) => {
      const cheapest = cheapestByCrop.get(a.crop) ?? null;
      const triggered =
        a.active && cheapest !== null
          ? a.direction === 'BELOW'
            ? cheapest.price <= a.targetPrice
            : cheapest.price >= a.targetPrice
          : false;
      return {
        id: a.id,
        crop: a.crop,
        targetPrice: a.targetPrice,
        direction: a.direction,
        active: a.active,
        createdAt: a.createdAt.toISOString(),
        currentCheapest: cheapest,
        triggered,
      };
    })
  );
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'BUYER') return errorResponse('Only buyer accounts have price alerts', 403);

  const body = schema.safeParse(await req.json());
  if (!body.success) return errorResponse(body.error.issues[0]?.message ?? 'Invalid input');

  const alert = await prisma.priceAlert.create({
    data: { buyerId: session.sub, ...body.data },
  });

  return successResponse(alert, 201);
});
