import { prisma } from '@/lib/prisma';
import type { CropType, MarketPrice } from '@prisma/client';

export interface MarketPricePoint {
  market: string;
  region: string;
  distanceKm: number;
  price: number;
  unit: string;
  currency: string;
  priceType: string;
  date: string;
}

export interface MarketSnapshot {
  commodity: CropType;
  nearest: MarketPricePoint | null;
  history: Array<{ date: string; price: number }>;
  trend: 'up' | 'down' | 'flat' | 'unknown';
  nearbyMarkets: MarketPricePoint[];
}

const RECENT_WINDOW_DAYS = 365;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Latest row per market, preferring `wholesale` over `retail` when both exist on the same date. */
function pickLatest(rows: MarketPrice[]): MarketPrice {
  return [...rows].sort((a, b) => {
    const byDate = b.date.getTime() - a.date.getTime();
    if (byDate !== 0) return byDate;
    return a.priceType === 'wholesale' ? -1 : b.priceType === 'wholesale' ? 1 : 0;
  })[0];
}

/**
 * Real WFP Tanzania market-price series (public/data/raw/wfp_food_prices_tza.csv).
 * Cassava has no WFP price series for Tanzania — callers get an honest
 * empty/"unknown" snapshot for it rather than fabricated numbers.
 */
export async function getMarketSnapshot(
  crop: CropType,
  lat: number,
  lon: number
): Promise<MarketSnapshot> {
  const rows = await prisma.marketPrice.findMany({ where: { commodity: crop } });

  if (rows.length === 0) {
    return { commodity: crop, nearest: null, history: [], trend: 'unknown', nearbyMarkets: [] };
  }

  const byMarket = new Map<string, MarketPrice[]>();
  for (const row of rows) {
    const list = byMarket.get(row.market) ?? [];
    list.push(row);
    byMarket.set(row.market, list);
  }

  const toPoint = (row: MarketPrice): MarketPricePoint => ({
    market: row.market,
    region: row.region,
    distanceKm: Number(haversineKm(lat, lon, row.latitude, row.longitude).toFixed(1)),
    price: row.price,
    unit: row.unit,
    currency: row.currency,
    priceType: row.priceType,
    date: row.date.toISOString().slice(0, 10),
  });

  const latestByMarket = Array.from(byMarket.entries()).map(([, list]) => toPoint(pickLatest(list)));
  latestByMarket.sort((a, b) => a.distanceKm - b.distanceKm);
  const nearest = latestByMarket[0] ?? null;

  let history: MarketSnapshot['history'] = [];
  let trend: MarketSnapshot['trend'] = 'unknown';
  if (nearest) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RECENT_WINDOW_DAYS);
    history = (byMarket.get(nearest.market) ?? [])
      .filter((r) => r.priceType === nearest.priceType && r.date >= cutoff)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((r) => ({ date: r.date.toISOString().slice(0, 10), price: r.price }));

    if (history.length >= 2) {
      const delta = history[history.length - 1].price - history[0].price;
      const pct = delta / history[0].price;
      trend = pct > 0.03 ? 'up' : pct < -0.03 ? 'down' : 'flat';
    }
  }

  return {
    commodity: crop,
    nearest,
    history,
    trend,
    nearbyMarkets: latestByMarket.slice(0, 6),
  };
}

export interface MarketOverviewRow extends Omit<MarketPricePoint, 'distanceKm'> {
  distanceKm: number | null;
  trend: 'up' | 'down' | 'flat' | 'unknown';
}

/**
 * All markets' latest price for a commodity, nationwide — for the buyer
 * market explorer. `buyerLocation` is optional (most buyers haven't set
 * one); when present, real distances are computed, otherwise `distanceKm`
 * is honestly `null` rather than a misleading placeholder.
 */
export async function getMarketOverview(
  crop: CropType,
  buyerLocation?: { lat: number; lon: number }
): Promise<MarketOverviewRow[]> {
  const rows = await prisma.marketPrice.findMany({ where: { commodity: crop } });
  if (rows.length === 0) return [];

  const byMarket = new Map<string, MarketPrice[]>();
  for (const row of rows) {
    const list = byMarket.get(row.market) ?? [];
    list.push(row);
    byMarket.set(row.market, list);
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_WINDOW_DAYS);

  const result: MarketOverviewRow[] = Array.from(byMarket.entries()).map(([market, list]) => {
    const latest = pickLatest(list);
    const recentSameType = list
      .filter((r) => r.priceType === latest.priceType && r.date >= cutoff)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let trend: MarketOverviewRow['trend'] = 'unknown';
    if (recentSameType.length >= 2) {
      const delta = recentSameType[recentSameType.length - 1].price - recentSameType[0].price;
      const pct = delta / recentSameType[0].price;
      trend = pct > 0.03 ? 'up' : pct < -0.03 ? 'down' : 'flat';
    }

    return {
      market,
      region: latest.region,
      distanceKm: buyerLocation
        ? Number(haversineKm(buyerLocation.lat, buyerLocation.lon, latest.latitude, latest.longitude).toFixed(1))
        : null,
      price: latest.price,
      unit: latest.unit,
      currency: latest.currency,
      priceType: latest.priceType,
      date: latest.date.toISOString().slice(0, 10),
      trend,
    };
  });

  result.sort((a, b) => b.date.localeCompare(a.date) || a.market.localeCompare(b.market));
  return result;
}
