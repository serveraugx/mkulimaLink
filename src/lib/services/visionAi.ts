import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Plant-photo disease check — an AI-assisted PRELIMINARY assessment, not a
 * diagnosis. There is no trained crop-disease model here (that would need
 * a PlantVillage-based model plus local validation images, see project
 * notes section 8); this instead asks a general-purpose vision model to
 * describe visible symptoms and give cautious, non-committal guidance,
 * with an explicit instruction not to claim certainty and to recommend a
 * local agricultural extension officer for anything serious.
 *
 * Gemini only — Groq's and the local LM Studio model's current lineup
 * don't reliably support image input, so this feature is unavailable
 * without a GEMINI_API_KEY rather than silently degrading to a worse
 * provider.
 */
export interface DiseaseCheckResult {
  available: boolean;
  assessment?: string;
  message?: string;
}

export async function checkPlantPhoto(
  base64Image: string,
  mimeType: string,
  cropLabel: string
): Promise<DiseaseCheckResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      available: false,
      message: 'Ukaguzi wa picha haupatikani bado (GEMINI_API_KEY haijawekwa).',
    };
  }

  const prompt = `Wewe ni Mkulima, msaidizi wa kilimo. Mkulima ametuma picha ya jani/mmea wa ${cropLabel}.

Toa TATHMINI YA AWALI TU ya dalili zinazoonekana kwenye picha (rangi, madoa, ukavu, wadudu, n.k). USITOE UTAMBUZI WA UHAKIKA — hii si mfumo wa kitaalamu wa utambuzi wa magonjwa. Kama picha haionyeshi dalili wazi au si mmea kabisa, sema hivyo.

Muundo wa jibu (Kiswahili, fupi):
1. Unachokiona kwenye picha
2. Uwezekano wa tatizo (kama lipo) — kwa tahadhari, si uhakika
3. Hatua za awali anazoweza kuchukua
4. Onyo: kama tatizo linaonekana kubwa, ashauriane na afisa ugani wa kilimo eneo lake

Usianze jibu kwa maneno kama "Ninagundua" — sema "Inaonekana" au "Kuna uwezekano" badala yake.`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash' });

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType, data: base64Image } },
    ]);
    const text = result.response.text();
    if (!text) throw new Error('Empty response');
    return { available: true, assessment: text };
  } catch (err) {
    console.error('[VisionAI]', err);
    return {
      available: false,
      message: 'Samahani, imeshindikana kuchambua picha kwa sasa. Jaribu tena baadaye.',
    };
  }
}
