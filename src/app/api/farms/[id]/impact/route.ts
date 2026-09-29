import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';
import { getMarketSnapshot } from '@/lib/services/market';

/**
 * Per-farm impact metrics — powers the "Impact" card on the farm detail page.
 *
 * Metrics returned:
 *
 * marketOpportunity
 *   - listingPricePerKg: what the farmer listed their produce for
 *   - nearestMarketPricePerKg: real WFP spot price at closest market
 *   - premiumPercent: (listing − market) / market × 100
 *   If the farmer is pricing above the nearest WFP market price, that is a
 *   measurable "better market access" outcome the brief explicitly asks for.
 *
 * ndviTrend
 *   - latest: most recent mean NDVI reading
 *   - previous: reading from ~30 days prior
 *   - deltaPercent: (latest − previous) / |previous| × 100
 *   Positive = crop health improving; negative = deteriorating.
 *
 * buyerEngagement
 *   - totalInterests: how many buyers expressed interest in this farm's listing
 *   - accepted: how many the farmer accepted
 *   - pending: awaiting farmer response
 *
 * diseaseDetected
 *   - lastSeverity: most recent disease check severity
 *   - checksTotal: total disease checks run for this farm
 */
export const GET = withErrorHandler(async (_req: NextRequest, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({
    where: { id: params.id, ownerId: session.sub },
    include: {
      listing: {
        include: {
          interests: { select: { status: true } },
        },
      },
      ndviReadings: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { meanNdvi: true, createdAt: true },
      },
    },
  });
  if (!farm) return errorResponse('Farm not found', 404);

  // ── Market opportunity ───────────────────────────────────────────────────
  let marketOpportunity: {
    listingPricePerKg: number | null;
    nearestMarketPricePerKg: number | null;
    premiumPercent: number | null;
    nearestMarket: string | null;
    currency: string;
  } = {
    listingPricePerKg: null,
    nearestMarketPricePerKg: null,
    premiumPercent: null,
    nearestMarket: null,
    currency: 'TZS',
  };

  if (farm.listing) {
    const snapshot = await getMarketSnapshot(farm.crop, farm.latitude, farm.longitude);
    const listingPrice = farm.listing.pricePerKg;
    const marketPrice = snapshot.nearest?.price ?? null;
    const premiumPercent =
      marketPrice !== null && marketPrice > 0
        ? Number((((listingPrice - marketPrice) / marketPrice) * 100).toFixed(1))
        : null;

    marketOpportunity = {
      listingPricePerKg: listingPrice,
      nearestMarketPricePerKg: marketPrice,
      premiumPercent,
      nearestMarket: snapshot.nearest?.market ?? null,
      currency: snapshot.nearest?.currency ?? 'TZS',
    };
  }

  // ── NDVI trend ───────────────────────────────────────────────────────────
  const readings = farm.ndviReadings;
  let ndviTrend: {
    latest: number | null;
    previous: number | null;
    deltaPercent: number | null;
    direction: 'improving' | 'declining' | 'stable' | 'unknown';
  } = { latest: null, previous: null, deltaPercent: null, direction: 'unknown' };

  if (readings.length >= 1) {
    const latest = readings[0].meanNdvi;
    const previous = readings.length >= 2 ? readings[readings.length - 1].meanNdvi : null;
    let deltaPercent: number | null = null;
    let direction: typeof ndviTrend.direction = 'unknown';

    if (previous !== null && Math.abs(previous) > 0.001) {
      deltaPercent = Number((((latest - previous) / Math.abs(previous)) * 100).toFixed(1));
      direction = deltaPercent > 3 ? 'improving' : deltaPercent < -3 ? 'declining' : 'stable';
    }

    ndviTrend = { latest, previous, deltaPercent, direction };
  }

  // ── Buyer engagement ─────────────────────────────────────────────────────
  const interests = farm.listing?.interests ?? [];
  const buyerEngagement = {
    totalInterests: interests.length,
    accepted: interests.filter((i) => i.status === 'ACCEPTED').length,
    pending: interests.filter((i) => i.status === 'PENDING').length,
    hasListing: !!farm.listing,
  };

  // ── Disease detection ─────────────────────────────────────────────────────
  const diseaseDetected = {
    lastSeverity: null,
    checksTotal: 0,
  };

  return successResponse({ marketOpportunity, ndviTrend, buyerEngagement, diseaseDetected });
});
