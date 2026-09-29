import { prisma } from '@/lib/prisma';
import type { CropType } from '@prisma/client';
import { haversineKm } from './market';

export interface ListingRow {
  listingId: string;
  farmName: string;
  farmerName: string;
  region: string | null;
  distanceKm: number | null;
  quantityKg: number;
  pricePerKg: number;
  currency: string;
  updatedAt: string;
  myInterestStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | null;
}

/** Active real farmer listings for a crop — what buyers actually browse to find produce to buy. */
export async function getListingsForCrop(
  crop: CropType,
  buyerId: string,
  buyerLocation?: { lat: number; lon: number }
): Promise<ListingRow[]> {
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE', farm: { crop } },
    include: {
      farm: { select: { name: true, latitude: true, longitude: true, owner: { select: { name: true, region: true } } } },
      interests: { where: { buyerId }, select: { status: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const rows: ListingRow[] = listings.map((l) => ({
    listingId: l.id,
    farmName: l.farm.name,
    farmerName: l.farm.owner.name,
    region: l.farm.owner.region,
    distanceKm: buyerLocation
      ? Number(haversineKm(buyerLocation.lat, buyerLocation.lon, l.farm.latitude, l.farm.longitude).toFixed(1))
      : null,
    quantityKg: l.quantityKg,
    pricePerKg: l.pricePerKg,
    currency: l.currency,
    updatedAt: l.updatedAt.toISOString(),
    myInterestStatus: l.interests[0]?.status ?? null,
  }));

  if (buyerLocation) rows.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  return rows;
}
