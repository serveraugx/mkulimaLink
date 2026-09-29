import { PrismaClient, CropType, PriceSource, StatElement, Role, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'public', 'data', 'raw');

/**
 * Approximate growth-stage durations (days after planting), used as a
 * stand-in for a live FAO Crop Calendar feed. See src/lib/services/cropCalendar.ts.
 */
const CROP_CALENDAR: Record<CropType, Array<{ stage: string; daysFromSow: number }>> = {
  MAIZE: [
    { stage: 'germination', daysFromSow: 0 },
    { stage: 'vegetative', daysFromSow: 10 },
    { stage: 'flowering', daysFromSow: 55 },
    { stage: 'grain_filling', daysFromSow: 70 },
    { stage: 'maturity', daysFromSow: 95 },
    { stage: 'harvest', daysFromSow: 115 },
  ],
  RICE: [
    { stage: 'germination', daysFromSow: 0 },
    { stage: 'vegetative', daysFromSow: 15 },
    { stage: 'flowering', daysFromSow: 65 },
    { stage: 'grain_filling', daysFromSow: 85 },
    { stage: 'maturity', daysFromSow: 105 },
    { stage: 'harvest', daysFromSow: 120 },
  ],
  CASSAVA: [
    { stage: 'germination', daysFromSow: 0 },
    { stage: 'vegetative', daysFromSow: 20 },
    { stage: 'root_development', daysFromSow: 90 },
    { stage: 'bulking', daysFromSow: 180 },
    { stage: 'maturity', daysFromSow: 270 },
    { stage: 'harvest', daysFromSow: 300 },
  ],
  BEANS: [
    { stage: 'germination', daysFromSow: 0 },
    { stage: 'vegetative', daysFromSow: 12 },
    { stage: 'flowering', daysFromSow: 35 },
    { stage: 'grain_filling', daysFromSow: 50 },
    { stage: 'maturity', daysFromSow: 75 },
    { stage: 'harvest', daysFromSow: 88 },
  ],
  TOMATO: [
    { stage: 'germination', daysFromSow: 0 },
    { stage: 'vegetative', daysFromSow: 20 },
    { stage: 'flowering', daysFromSow: 45 },
    { stage: 'fruit_development', daysFromSow: 65 },
    { stage: 'maturity', daysFromSow: 90 },
    { stage: 'harvest', daysFromSow: 110 },
  ],
};

async function seedCropCalendar() {
  for (const [crop, stages] of Object.entries(CROP_CALENDAR)) {
    for (const s of stages) {
      await prisma.cropCalendarStage.upsert({
        where: { crop_stage: { crop: crop as CropType, stage: s.stage } },
        update: { daysFromSow: s.daysFromSow },
        create: { crop: crop as CropType, stage: s.stage, daysFromSow: s.daysFromSow },
      });
    }
  }
  console.log('Seeded crop calendar stages.');
}

/** WFP commodity name -> our CropType. Tanzania's WFP series has no cassava price data. */
const WFP_COMMODITY_MAP: Record<string, CropType> = {
  Maize: CropType.MAIZE,
  Rice: CropType.RICE,
  Beans: CropType.BEANS,
  Tomatoes: CropType.TOMATO,
};

interface WfpRow {
  date: string;
  admin1: string;
  admin2: string;
  market: string;
  market_id: string;
  latitude: string;
  longitude: string;
  category: string;
  commodity: string;
  commodity_id: string;
  unit: string;
  priceflag: string;
  pricetype: string;
  currency: string;
  price: string;
  usdprice: string;
}

/** Real WFP Tanzania food-price series (public/data/raw/wfp_food_prices_tza.csv, via HDX). */
async function ingestMarketPrices() {
  const filePath = path.join(DATA_DIR, 'wfp_food_prices_tza.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows: WfpRow[] = parse(content, { columns: true, skip_empty_lines: true, bom: true });

  const toInsert: Prisma.MarketPriceCreateManyInput[] = [];

  for (const row of rows) {
    const crop = WFP_COMMODITY_MAP[row.commodity];
    if (!crop) continue;

    const rawPrice = Number(row.price);
    const lat = Number(row.latitude);
    const lon = Number(row.longitude);
    if (!Number.isFinite(rawPrice) || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    // Normalize to price per kg — the series mixes "100 KG" (bulk/wholesale
    // sacks) and "KG" units.
    let pricePerKg: number;
    if (row.unit === '100 KG') pricePerKg = rawPrice / 100;
    else if (row.unit === 'KG') pricePerKg = rawPrice;
    else continue;

    const date = new Date(row.date);
    if (Number.isNaN(date.getTime())) continue;

    toInsert.push({
      market: row.market,
      region: row.admin1,
      latitude: lat,
      longitude: lon,
      commodity: crop,
      unit: 'kg',
      price: Number(pricePerKg.toFixed(2)),
      currency: row.currency || 'TZS',
      priceType: row.pricetype.toLowerCase(),
      date,
      source: PriceSource.WFP,
    });
  }

  // Clear everything, including any leftover rows from the old hand-curated
  // SAMPLE seed — this ingestion is now the sole source of market prices.
  await prisma.marketPrice.deleteMany({});

  const CHUNK = 5000;
  for (let i = 0; i < toInsert.length; i += CHUNK) {
    await prisma.marketPrice.createMany({ data: toInsert.slice(i, i + CHUNK) });
  }

  console.log(`Ingested ${toInsert.length} real WFP market price observations.`);
}

/** FAOSTAT item -> our CropType (public/data/raw/FAOSTAT_data_en_9-28-2026.csv, Tanzania). */
const FAOSTAT_ITEM_MAP: Record<string, CropType> = {
  'Maize (corn)': CropType.MAIZE,
  Rice: CropType.RICE,
  'Cassava, fresh': CropType.CASSAVA,
  'Beans, dry': CropType.BEANS,
  Tomatoes: CropType.TOMATO,
};

const FAOSTAT_ELEMENT_MAP: Record<string, StatElement> = {
  Production: StatElement.PRODUCTION,
  Yield: StatElement.YIELD,
  'Area harvested': StatElement.AREA_HARVESTED,
};

interface FaostatRow {
  Item: string;
  Element: string;
  Year: string;
  Value: string;
  Unit: string;
}

async function ingestFaostat() {
  const filePath = path.join(DATA_DIR, 'FAOSTAT_data_en_9-28-2026.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const rows: FaostatRow[] = parse(content, { columns: true, skip_empty_lines: true, bom: true });

  const toInsert = [];
  for (const row of rows) {
    const crop = FAOSTAT_ITEM_MAP[row.Item];
    const element = FAOSTAT_ELEMENT_MAP[row.Element];
    if (!crop || !element) continue;

    const value = Number(row.Value);
    const year = Number(row.Year);
    if (!Number.isFinite(value) || !Number.isFinite(year)) continue;

    toInsert.push({ crop, year, element, value, unit: row.Unit });
  }

  await prisma.nationalCropStat.deleteMany({});
  await prisma.nationalCropStat.createMany({ data: toInsert });
  let count = toInsert.length;
  console.log(`Ingested ${count} FAOSTAT national crop-stat observations.`);
}

async function seedDemoUsers() {
  async function upsertUser(email: string, name: string, password: string, role: Role, region: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;
    return prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 10), role, region },
    });
  }

  const farmer = await upsertUser('juma@mkulima.demo', 'Juma', 'mkulima123', Role.FARMER, 'Zanzibar');
  await upsertUser('amina@mkulima.demo', 'Amina (Buyer)', 'mkulima123', Role.BUYER, 'Dar es Salaam');
  await upsertUser('admin@mkulima.demo', 'Mkulima Admin', 'mkulima123', Role.ADMIN, 'Dodoma');

  const existingFarm = await prisma.farm.findFirst({ where: { ownerId: farmer.id } });
  if (!existingFarm) {
    const plantingDate = new Date();
    plantingDate.setDate(plantingDate.getDate() - 60);
    await prisma.farm.create({
      data: {
        name: 'Shamba la Juma',
        ownerId: farmer.id,
        latitude: -6.1659,
        longitude: 39.2026,
        sizeHectares: 2.4,
        crop: CropType.MAIZE,
        plantingDate,
      },
    });
  }

  console.log('Seeded demo logins: juma@mkulima.demo / amina@mkulima.demo / admin@mkulima.demo (password: mkulima123)');
}

async function main() {
  await seedCropCalendar();
  await ingestMarketPrices();
  await ingestFaostat();
  await seedDemoUsers();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
