const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/prisma/seed.ts';
let content = fs.readFileSync(path, 'utf8');

const oldFaostat = `  let count = 0;
  for (const row of rows) {
    const crop = FAOSTAT_ITEM_MAP[row.Item];
    const element = FAOSTAT_ELEMENT_MAP[row.Element];
    if (!crop || !element) continue;

    const value = Number(row.Value);
    const year = Number(row.Year);
    if (!Number.isFinite(value) || !Number.isFinite(year)) continue;

    await prisma.nationalCropStat.upsert({
      where: { crop_year_element: { crop, year, element } },
      update: { value, unit: row.Unit },
      create: { crop, year, element, value, unit: row.Unit },
    });
    count++;
  }`;

const newFaostat = `  const toInsert = [];
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
  let count = toInsert.length;`;

content = content.replace(oldFaostat, newFaostat);

fs.writeFileSync(path, content);
console.log("Patched seed.ts to batch insert FAOSTAT");
