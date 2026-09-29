const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/.env';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'DIRECT_URL="postgresql://postgres.rnnxttiaygyiizjcydbv:hackathon%401@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"',
  'DIRECT_URL="postgresql://postgres.rnnxttiaygyiizjcydbv:hackathon%401@db.rnnxttiaygyiizjcydbv.supabase.co:5432/postgres"'
);

fs.writeFileSync(path, content);
console.log("Patched DIRECT_URL to true IPv6 host");
