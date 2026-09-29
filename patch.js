const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/src/app/(dashboard)/dashboard/farms/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /async function textMeStatus\(\) \{[\s\S]*?setTexting\(false\);\n    \}\n  \}/,
  `async function textMeStatus() {
    setTexting(true);
    setTextResult(null);
    try {
      const res = await api.post(\`/farms/\${params.id}/sms-status\`, {});
      setTextResult(res.data.data.preview || 'SMS sent.');
    } catch (err: any) {
      const errData = err.response?.data?.error;
      setTextResult(typeof errData === 'string' ? errData : errData ? JSON.stringify(errData) : 'Failed to send SMS');
    } finally {
      setTexting(false);
    }
  }`
);

fs.writeFileSync(path, content);
console.log("Patched page.tsx");
