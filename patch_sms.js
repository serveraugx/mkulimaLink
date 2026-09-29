const fs = require('fs');
const path = '/home/server/Desktop/P/NextJS/src/lib/services/sms.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `export async function sendSms(recipient: string, content: string): Promise<SmsResult> {
  const apiKey = process.env.BRIQ_API_KEY;`,
  `export async function sendSms(recipient: string, content: string): Promise<SmsResult> {
  if (process.env.BRIQ_DEMO_MODE === 'true') {
    console.log(\`[SMS DEMO] Intercepted message to \${recipient}:\\n\${content}\`);
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, message: 'Message sent (DEMO MODE)' };
  }
  const apiKey = process.env.BRIQ_API_KEY;`
);

fs.writeFileSync(path, content);
console.log("Patched sms.ts");
