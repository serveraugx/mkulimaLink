const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/.env.local';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'COPERNICUS_CLIENT_SECRET=sUrXKsDBGPPFDfbbeLcZciET8uXKBRSH\\n# Expo Demo Mode: intercepts SMS sends so they succeed without a real Sender ID\\nBRIQ_DEMO_MODE=true',
  'COPERNICUS_CLIENT_SECRET=sUrXKsDBGPPFDfbbeLcZciET8uXKBRSH\n\n# Expo Demo Mode: intercepts SMS sends so they succeed without a real Sender ID\nBRIQ_DEMO_MODE=true'
);

fs.writeFileSync(path, content);
console.log("Patched .env.local");
