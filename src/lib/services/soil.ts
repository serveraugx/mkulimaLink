/**
 * Soil intelligence via SoilGrids (ISRIC) — 250m global soil property maps.
 * https://rest.isric.org/soilgrids/v2.0/docs
 *
 * SoilGrids returns `mean: null` (HTTP 200, not an error) for pixels its
 * 250m grid masks out — confirmed by direct testing to be a real, stable
 * geographic pattern: points right on a coastline or in a dense urban area
 * (e.g. Zanzibar's Stone Town) come back null, while points a few km inland
 * on the same island return real values. So instead of giving up at the
 * exact farm coordinate, we search outward for the nearest pixel that does
 * have data and report it honestly as an approximation with its distance —
 * real regional soil data beats a flat "unavailable", as long as it's
 * clearly labeled as not being the exact point.
 */

export interface SoilProfile {
  available: boolean;
  ph?: number;
  organicCarbonPercent?: number;
  clayPercent?: number;
  sandPercent?: number;
  nitrogenGKg?: number;
  cecMmolKg?: number;
  /** Set when the exact coordinate had no data and this is from the nearest valid pixel found instead. */
  approximated?: boolean;
  distanceKm?: number;
  message?: string;
}

const PROPERTIES = ['phh2o', 'soc', 'clay', 'sand', 'nitrogen', 'cec'];
const PER_REQUEST_TIMEOUT_MS = 5000;
const SEARCH_RADII_KM = [2, 5, 10, 20];
const SEARCH_BEARINGS_DEG = [0, 45, 90, 135, 180, 225, 270, 315];

/** Great-circle destination point at `distanceKm` along `bearingDeg` from (lat, lon). */
function offsetPoint(lat: number, lon: number, distanceKm: number, bearingDeg: number) {
  const R = 6371;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lon1 = (lon * Math.PI) / 180;
  const angularDist = distanceKm / R;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDist) + Math.cos(lat1) * Math.sin(angularDist) * Math.cos(bearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(lat1),
      Math.cos(angularDist) - Math.sin(lat1) * Math.sin(lat2)
    );

  return { lat: (lat2 * 180) / Math.PI, lon: (((lon2 * 180) / Math.PI + 540) % 360) - 180 };
}

interface RawQueryResult {
  ph?: number;
  organicCarbonPercent?: number;
  clayPercent?: number;
  sandPercent?: number;
  nitrogenGKg?: number;
  cecMmolKg?: number;
}

/** One point query. Returns undefined on any failure/timeout/all-null response. */
async function queryPoint(lat: number, lon: number): Promise<RawQueryResult | undefined> {
  const url = new URL('https://rest.isric.org/soilgrids/v2.0/properties/query');
  url.searchParams.set('lon', lon.toFixed(4));
  url.searchParams.set('lat', lat.toFixed(4));
  for (const p of PROPERTIES) url.searchParams.append('property', p);
  url.searchParams.set('depth', '0-5cm');
  url.searchParams.set('value', 'mean');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PER_REQUEST_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 60 * 60 * 24 * 30 } });
    clearTimeout(timeout);
    if (!res.ok) return undefined;

    const data = await res.json();
    const layers: Array<{ name: string; depths: Array<{ values: { mean: number } }>; unit_measure: { d_factor: number } }> =
      data.properties.layers;

    const read = (name: string) => {
      const layer = layers.find((l) => l.name === name);
      const raw = layer?.depths?.[0]?.values?.mean;
      const factor = layer?.unit_measure?.d_factor ?? 1;
      return typeof raw === 'number' ? raw / factor : undefined;
    };

    const ph = read('phh2o');
    const soc = read('soc');
    const clayPercent = read('clay');
    const sandPercent = read('sand');
    const nitrogenGKg = read('nitrogen');
    const cecMmolKg = read('cec');

    if ([ph, soc, clayPercent, sandPercent, nitrogenGKg, cecMmolKg].every((v) => v === undefined)) {
      return undefined;
    }

    return {
      ph,
      organicCarbonPercent: soc !== undefined ? Number((soc / 10).toFixed(2)) : undefined,
      clayPercent,
      sandPercent,
      nitrogenGKg,
      cecMmolKg,
    };
  } catch {
    return undefined;
  }
}

export async function getSoilProfile(lat: number, lon: number): Promise<SoilProfile> {
  const exact = await queryPoint(lat, lon);
  if (exact) return { available: true, ...exact };

  // Exact point has no data — search outward ring by ring. Each ring's 8
  // bearings are queried in PARALLEL (not one-by-one): SoilGrids is a free,
  // best-effort public API and a strictly sequential search of up to 32
  // points was observed to be both slow and prone to the API slowing down
  // under a long burst of sequential hits. A handful of parallel batches is
  // both faster and lighter on the API than 32 sequential requests.
  for (const radiusKm of SEARCH_RADII_KM) {
    const candidates = SEARCH_BEARINGS_DEG.map((bearing) => offsetPoint(lat, lon, radiusKm, bearing));
    const results = await Promise.all(candidates.map((c) => queryPoint(c.lat, c.lon)));
    const hitIndex = results.findIndex((r) => r !== undefined);
    if (hitIndex !== -1) {
      return { available: true, ...(results[hitIndex] as RawQueryResult), approximated: true, distanceKm: radiusKm };
    }
  }

  return {
    available: false,
    message: `SoilGrids has no coverage within ${SEARCH_RADII_KM[SEARCH_RADII_KM.length - 1]}km of this location (common right on coastlines/small islands).`,
  };
}
