import { prisma } from '@/lib/prisma';
import type { CropType } from '@prisma/client';

export interface NationalCropContext {
  year: number;
  productionTonnes: number | null;
  yieldKgPerHa: number | null;
  areaHarvestedHa: number | null;
  productionTrend: 'up' | 'down' | 'flat' | 'unknown';
}

/** Latest-year national production context from FAOSTAT (public/data/raw/FAOSTAT_data_en_9-28-2026.csv), Tanzania. */
export async function getNationalCropContext(crop: CropType): Promise<NationalCropContext | null> {
  const rows = await prisma.nationalCropStat.findMany({
    where: { crop },
    orderBy: { year: 'desc' },
  });
  if (rows.length === 0) return null;

  const latestYear = rows[0].year;
  const byYear = new Map<number, typeof rows>();
  for (const r of rows) {
    const list = byYear.get(r.year) ?? [];
    list.push(r);
    byYear.set(r.year, list);
  }

  const pick = (year: number, element: 'PRODUCTION' | 'YIELD' | 'AREA_HARVESTED') =>
    byYear.get(year)?.find((r) => r.element === element)?.value ?? null;

  const production = pick(latestYear, 'PRODUCTION');
  const prevProduction = pick(latestYear - 1, 'PRODUCTION');

  let productionTrend: NationalCropContext['productionTrend'] = 'unknown';
  if (production !== null && prevProduction !== null && prevProduction > 0) {
    const pct = (production - prevProduction) / prevProduction;
    productionTrend = pct > 0.03 ? 'up' : pct < -0.03 ? 'down' : 'flat';
  }

  return {
    year: latestYear,
    productionTonnes: production,
    yieldKgPerHa: pick(latestYear, 'YIELD'),
    areaHarvestedHa: pick(latestYear, 'AREA_HARVESTED'),
    productionTrend,
  };
}
