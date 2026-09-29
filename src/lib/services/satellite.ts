/**
 * Satellite coverage via the Copernicus Data Space Ecosystem's public STAC
 * catalog (catalogue.dataspace.copernicus.eu) — confirmed live and
 * unauthenticated for search + quicklook thumbnails. This is real, current
 * Sentinel-2 data, not a mock.
 *
 * Deliberately NOT full NDVI: actually computing per-pixel vegetation index
 * requires downloading the B04/B08 raster bands, which sit behind
 * Copernicus's OIDC auth (a free but separate registration this app has no
 * credentials for). What's here — the date of the most recent usable pass,
 * its cloud cover, and a real quicklook image — is honestly labeled as
 * coverage/visibility, not a computed crop-health number, so it doesn't
 * overclaim into the territory of section 3's NDVI vision.
 */

export interface SatellitePass {
  available: boolean;
  date?: string;
  cloudCoverPercent?: number;
  vegetationPercent?: number;
  thumbnailUrl?: string;
  satellite?: string;
  message?: string;
}

interface StacFeature {
  id: string;
  properties: {
    datetime: string;
    'eo:cloud_cover': number;
    platform: string;
    statistics?: { vegetation?: number };
  };
  assets: {
    thumbnail?: { href: string };
  };
}

const SEARCH_WINDOW_DAYS = 45;
const BBOX_BUFFER_DEG = 0.03; // ~3km — enough to reliably hit the covering MGRS tile

export async function getLatestSatellitePass(lat: number, lon: number): Promise<SatellitePass> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - SEARCH_WINDOW_DAYS);

  const bbox = [lon - BBOX_BUFFER_DEG, lat - BBOX_BUFFER_DEG, lon + BBOX_BUFFER_DEG, lat + BBOX_BUFFER_DEG].join(',');
  const url = new URL('https://catalogue.dataspace.copernicus.eu/stac/search');
  url.searchParams.set('bbox', bbox);
  url.searchParams.set('datetime', `${start.toISOString()}/${end.toISOString()}`);
  url.searchParams.set('collections', 'sentinel-2-l2a');
  url.searchParams.set('limit', '15');
  url.searchParams.set('sortby', '-datetime');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 60 * 60 * 6 } });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`STAC search returned ${res.status}`);

    const data = await res.json();
    const features: StacFeature[] = data.features ?? [];
    if (features.length === 0) {
      return { available: false, message: `No Sentinel-2 pass found in the last ${SEARCH_WINDOW_DAYS} days for this location.` };
    }

    // Prefer the least cloudy scene within the window — a farmer looking at
    // a mostly-cloud thumbnail from yesterday learns nothing useful.
    const best = [...features].sort((a, b) => a.properties['eo:cloud_cover'] - b.properties['eo:cloud_cover'])[0];

    return {
      available: true,
      date: best.properties.datetime.slice(0, 10),
      cloudCoverPercent: Math.round(best.properties['eo:cloud_cover'] * 10) / 10,
      vegetationPercent: best.properties.statistics?.vegetation
        ? Math.round(best.properties.statistics.vegetation * 10) / 10
        : undefined,
      thumbnailUrl: best.assets.thumbnail?.href,
      satellite: best.properties.platform,
    };
  } catch (err) {
    return {
      available: false,
      message: 'Satellite catalog is temporarily unavailable. Try again later.',
    };
  }
}
