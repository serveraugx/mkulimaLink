const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/.env';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/hackathon@1/g, 'hackathon%401');

fs.writeFileSync(path, content);
console.log("Patched password encoding in .env");
