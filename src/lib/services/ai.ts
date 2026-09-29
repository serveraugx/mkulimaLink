import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Agricultural Assistant. The model is a communication/reasoning layer
 * only — it receives the Decision Engine's verified outputs as structured
 * context and explains them in Swahili. It is never asked to invent
 * agricultural facts on its own (see project notes, section 7/26).
 *
 * Provider chain: Gemini (primary) -> Groq (backup, OpenAI-compatible) ->
 * local LM Studio server (offline/dev fallback, OpenAI-compatible). Each
 * provider is skipped if unconfigured, and failures fall through to the
 * next rather than surfacing an error to the farmer.
 */

export type AiAudience = 'farmer' | 'buyer';

function buildPrompt(question: string, context: Record<string, unknown>, audience: AiAudience): string {
  const audienceLine =
    audience === 'farmer'
      ? 'Wewe ni Mkulima, msaidizi wa kilimo anayezungumza Kiswahili rahisi na mkulima wa Tanzania.'
      : 'Wewe ni Mkulima, msaidizi anayezungumza Kiswahili rahisi na mnunuzi anayetafuta kununua mazao kutoka kwa wakulima wa Tanzania.';
  const askerLabel = audience === 'farmer' ? 'MKULIMA' : 'MNUNUZI';
  const dataLabel = audience === 'farmer' ? 'DATA YA SHAMBA' : 'DATA YA SOKO';

  return `${audienceLine}
Jibu SWALI ukitumia TU data iliyothibitishwa hapa chini. Usibuni takwimu ambazo hazipo kwenye data.
Kama data haitoshi kujibu, sema hivyo waziwazi. Jibu kwa sentensi fupi, za vitendo (si zaidi ya aya moja au mbili).

${dataLabel} (JSON):
${JSON.stringify(context, null, 2)}

SWALI LA ${askerLabel}:
${question}`;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
  }
}

async function askGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash' });
  const result = await withTimeout(model.generateContent(prompt), 15000);
  const text = result.response.text();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

/** Any OpenAI-compatible chat completions endpoint (Groq, LM Studio, etc). */
async function askOpenAiCompatible(opts: {
  baseUrl: string;
  apiKey?: string;
  model: string;
  prompt: string;
  timeoutMs: number;
}): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);
  try {
    const res = await fetch(`${opts.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: opts.model,
        messages: [{ role: 'user', content: opts.prompt }],
        temperature: 0.3,
      }),
    });
    if (!res.ok) throw new Error(`${opts.baseUrl} returned ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error(`${opts.baseUrl} returned no content`);
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function askGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');
  return askOpenAiCompatible({
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey,
    model: process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b',
    prompt,
    timeoutMs: 15000,
  });
}

async function askLocalLlm(prompt: string): Promise<string> {
  const baseUrl = process.env.LOCAL_LLM_BASE_URL ?? 'http://localhost:1234/v1';
  return askOpenAiCompatible({
    baseUrl,
    model: process.env.LOCAL_LLM_MODEL ?? 'google/gemma-4-31b-qat',
    prompt,
    // Short timeout — this is a best-effort local dev fallback, not always running.
    timeoutMs: 8000,
  });
}

const PROVIDERS: Array<{ name: string; run: (prompt: string) => Promise<string> }> = [
  { name: 'gemini', run: askGemini },
  { name: 'groq', run: askGroq },
  { name: 'local', run: askLocalLlm },
];

export async function askMkulima(
  question: string,
  context: Record<string, unknown>,
  audience: AiAudience = 'farmer'
): Promise<string> {
  const prompt = buildPrompt(question, context, audience);
  const errors: string[] = [];

  for (const provider of PROVIDERS) {
    try {
      return await provider.run(prompt);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${provider.name}: ${message}`);
      console.error(`[AI:${provider.name}]`, message);
    }
  }

  console.error('[AI] All providers failed:', errors.join(' | '));
  return (
    'Samahani, mfumo wa AI haupatikani kwa sasa (Gemini, Groq na LLM ya ndani zote hazikujibu). ' +
    'Tazama data ya shamba lako hapo juu kwa taarifa za sasa.'
  );
}
