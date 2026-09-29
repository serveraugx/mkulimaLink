const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/src/app/(auth)/login/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '          <h1 className="text-2xl font-bold text-white">MKULIMA</h1>',
  '          <h1 className="text-2xl font-bold text-white">Mkulima Link</h1>'
);

content = content.replace(
  '          <Sprout className="text-green-500" size={28} />',
  '          <Sprout className="text-emerald-500" size={28} />'
);

content = content.replace(
  /bg-green-600/g,
  'bg-emerald-600'
);

content = content.replace(
  /hover:bg-green-500/g,
  'hover:bg-emerald-500'
);

content = content.replace(
  /focus:border-green-500/g,
  'focus:border-emerald-500'
);

content = content.replace(
  /text-green-400/g,
  'text-emerald-400'
);

content = content.replace(
  /hover:text-green-300/g,
  'hover:text-emerald-300'
);

fs.writeFileSync(path, content);
console.log("Patched login.tsx");
