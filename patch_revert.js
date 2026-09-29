const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/.env';
const content = `# Used only by the Prisma CLI (which doesn't read .env.local). Runtime env
# vars for the app itself live in .env.local (Next.js convention).
DATABASE_URL="postgresql://postgres.rnnxttiaygyiizjcydbv:hackathon@1@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.rnnxttiaygyiizjcydbv:hackathon@1@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"
`;
fs.writeFileSync(path, content);
console.log("Reverted .env");
