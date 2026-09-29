import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { errorResponse, withErrorHandler } from '@/lib/apiHelpers';
import { getLatestSatellitePass } from '@/lib/services/satellite';

/**
 * Proxies the Copernicus quicklook JPEG. The upstream (CREODIAS) asset
 * server sends `Content-Type: application/octet-stream` with
 * `Content-Disposition: attachment` — correct for their programmatic-
 * download use case, but Chromium (rightly) won't render that as an <img>.
 * Re-serving it with an honest image content-type fixes that without
 * altering a single byte of the real image.
 */
export const GET = withErrorHandler(async (_req, context) => {
  const { params } = context as { params: { id: string } };
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);

  const farm = await prisma.farm.findFirst({ where: { id: params.id, ownerId: session.sub } });
  if (!farm) return errorResponse('Farm not found', 404);

  const pass = await getLatestSatellitePass(farm.latitude, farm.longitude);
  if (!pass.available || !pass.thumbnailUrl) return errorResponse('No satellite thumbnail available', 404);

  const upstream = await fetch(pass.thumbnailUrl);
  if (!upstream.ok || !upstream.body) return errorResponse('Failed to fetch satellite thumbnail', 502);

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=21600', // matches the 6h revalidate on the STAC search
    },
  });
});
