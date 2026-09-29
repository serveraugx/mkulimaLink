const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '  url      = env("DATABASE_URL")',
  '  url      = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")'
);

fs.writeFileSync(path, content);
console.log("Patched schema.prisma with directUrl");
