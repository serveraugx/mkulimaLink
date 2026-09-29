const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/.env.local';
if (fs.existsSync(path)) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/GEMINI_MODEL=gemini-2\.5-flash/g, 'GEMINI_MODEL=gemini-3.8-flash');
  fs.writeFileSync(path, content);
  console.log("Updated GEMINI_MODEL to gemini-3.8-flash in .env.local");
}

const readmePath = '/home/server/Desktop/P/NextJS/README.md';
if (fs.existsSync(readmePath)) {
  let content = fs.readFileSync(readmePath, 'utf8');
  content = content.replace(/gemini-2\.5-flash/g, 'gemini-3.8-flash');
  fs.writeFileSync(readmePath, content);
  console.log("Updated README.md");
}
