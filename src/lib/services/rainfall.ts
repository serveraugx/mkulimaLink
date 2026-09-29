/**
 * Rainfall & drought intelligence.
 *
 * Combines Open-Meteo's historical archive (actual rainfall over the last
 * 30 days) with NASA POWER's long-term climatology (the expected average for
 * this time of year) to compute a rainfall anomaly. This stands in for a
 * full CHIRPS pipeline (see project notes) — CHIRPS gives higher-resolution,
 * longer-baseline rainfall but requires downloading and caching raster
 * archives rather than a single live call, which is out of scope for this
 * slice.
 */

export type RainfallStatus = 'drought' | 'below_normal' | 'normal' | 'above_normal' | 'excessive';

export interface RainfallSnapshot {
  last30DaysMm: number;
  historicalAverageMm: number;
  anomalyPercent: number;
  status: RainfallStatus;
}

function classify(anomalyPercent: number): RainfallStatus {
  if (anomalyPercent <= -40) return 'drought';
  if (anomalyPercent <= -15) return 'below_normal';
  if (anomalyPercent < 20) return 'normal';
  if (anomalyPercent < 50) return 'above_normal';
  return 'excessive';
}

const MONTH_KEYS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export async function getRainfallStatus(lat: number, lon: number): Promise<RainfallSnapshot> {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 30);
  const end = new Date(today);
  end.setDate(end.getDate() - 1); // archive API lags ~1 day

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const archiveUrl = new URL('https://archive-api.open-meteo.com/v1/archive');
  archiveUrl.searchParams.set('latitude', lat.toFixed(4));
  archiveUrl.searchParams.set('longitude', lon.toFixed(4));
  archiveUrl.searchParams.set('start_date', fmt(start));
  archiveUrl.searchParams.set('end_date', fmt(end));
  archiveUrl.searchParams.set('daily', 'precipitation_sum');
  archiveUrl.searchParams.set('timezone', 'auto');

  const powerUrl = new URL('https://power.larc.nasa.gov/api/temporal/climatology/point');
  powerUrl.searchParams.set('parameters', 'PRECTOTCORR');
  powerUrl.searchParams.set('community', 'AG');
  powerUrl.searchParams.set('longitude', lon.toFixed(4));
  powerUrl.searchParams.set('latitude', lat.toFixed(4));
  powerUrl.searchParams.set('format', 'JSON');

  const [archiveRes, powerRes] = await Promise.all([
    fetch(archiveUrl, { next: { revalidate: 60 * 60 * 12 } }),
    fetch(powerUrl, { next: { revalidate: 60 * 60 * 24 * 7 } }),
  ]);

  if (!archiveRes.ok) throw new Error(`Open-Meteo archive failed: ${archiveRes.status}`);
  if (!powerRes.ok) throw new Error(`NASA POWER climatology failed: ${powerRes.status}`);

  const archiveData = await archiveRes.json();
  const powerData = await powerRes.json();

  const daily: number[] = archiveData.daily.precipitation_sum ?? [];
  const last30DaysMm = Number(daily.reduce((sum, v) => sum + (v ?? 0), 0).toFixed(1));

  const monthKey = MONTH_KEYS[today.getMonth()];
  const dailyAvgMmPerDay: number = powerData.properties.parameter.PRECTOTCORR[monthKey];
  const historicalAverageMm = Number((dailyAvgMmPerDay * 30).toFixed(1));

  const anomalyPercent =
    historicalAverageMm > 0
      ? Number((((last30DaysMm - historicalAverageMm) / historicalAverageMm) * 100).toFixed(1))
      : 0;

  return {
    last30DaysMm,
    historicalAverageMm,
    anomalyPercent,
    status: classify(anomalyPercent),
  };
}
