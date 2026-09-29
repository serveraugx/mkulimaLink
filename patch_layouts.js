const fs = require('fs');

function patchFile(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  
  content = content.replace(
    '<span className="text-xl font-bold text-white">MKULIMA</span>',
    '<span className="text-xl font-bold text-white tracking-tight">Mkulima Link</span>'
  );
  
  content = content.replace(
    /<Sprout className="text-green-500"/g,
    '<Sprout className="text-emerald-500"'
  );
  
  content = content.replace(
    /bg-green-600/g,
    'bg-emerald-600'
  );
  
  content = content.replace(
    /hover:bg-green-500/g,
    'hover:bg-emerald-500'
  );
  
  fs.writeFileSync(path, content);
  console.log("Patched " + path);
}

patchFile('/home/server/Desktop/P/NextJS/src/components/layout/Sidebar.tsx');
patchFile('/home/server/Desktop/P/NextJS/src/components/layout/SimpleShell.tsx');
