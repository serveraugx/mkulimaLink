/**
 * SMS via Briq (karibu.briq.tz) — a real Tanzanian bulk-SMS provider, not a
 * stub. API contract confirmed against https://docs.briq.tz:
 *   POST /v1/message/send-instant
 *   Header: X-API-Key: <key>
 *   Body: { content, recipients: string[], sender_id }
 *
 * SMS is always a best-effort side notification here — a failed send
 * (unconfigured, invalid number, provider error) never blocks the action
 * that triggered it (creating/accepting an interest request, etc).
 */

export interface SmsResult {
  success: boolean;
  message?: string;
}

export async function sendSms(recipient: string, content: string): Promise<SmsResult> {
  if (process.env.BRIQ_DEMO_MODE === 'true') {
    console.log(`[SMS DEMO] Intercepted message to ${recipient}:\n${content}`);
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, message: 'Message sent (DEMO MODE)' };
  }
  const apiKey = process.env.BRIQ_API_KEY;
  const senderId = process.env.BRIQ_SENDER_ID || 'BRIQ';
  if (!apiKey) return { success: false, message: 'SMS not configured (BRIQ_API_KEY not set)' };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://karibu.briq.tz/v1/message/send-instant', {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify({ content, recipients: [recipient], sender_id: senderId }),
    });
    clearTimeout(timeout);

    const data = await res.json();
    if (!res.ok || data.success === false) {
      const detail = data.detail || data.errors?.[0]?.message || data.message || `HTTP ${res.status}`;
      console.error('[SMS] Briq send failed:', detail);
      return { success: false, message: detail };
    }
    return { success: true, message: data.message };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'SMS send failed';
    console.error('[SMS] Briq send error:', message);
    return { success: false, message };
  }
}
