import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { errorResponse, successResponse, withErrorHandler } from '@/lib/apiHelpers';

async function checkLocalLlm(): Promise<{ configured: boolean; reachable: boolean; models: string[] }> {
  const baseUrl = process.env.LOCAL_LLM_BASE_URL;
  if (!baseUrl) return { configured: false, reachable: false, models: [] };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return { configured: true, reachable: false, models: [] };
    const data = await res.json();
    return { configured: true, reachable: true, models: (data.data ?? []).map((m: { id: string }) => m.id) };
  } catch {
    return { configured: true, reachable: false, models: [] };
  }
}

export const GET = withErrorHandler(async () => {
  const session = await getSession();
  if (!session) return errorResponse('Not authenticated', 401);
  if (session.role !== 'ADMIN') return errorResponse('Forbidden', 403);

  const [byCommodity, faostatByCrop, localLlm] = await Promise.all([
    prisma.marketPrice.groupBy({
      by: ['commodity'],
      _count: { commodity: true },
      _max: { date: true },
      _min: { date: true },
    }),
    prisma.nationalCropStat.groupBy({
      by: ['crop'],
      _count: { crop: true },
      _max: { year: true },
      _min: { year: true },
    }),
    checkLocalLlm(),
  ]);

  return successResponse({
    marketPrices: byCommodity.map((c) => ({
      commodity: c.commodity,
      rows: c._count.commodity,
      earliest: c._min.date?.toISOString().slice(0, 10) ?? null,
      latest: c._max.date?.toISOString().slice(0, 10) ?? null,
    })),
    faostat: faostatByCrop.map((c) => ({
      crop: c.crop,
      rows: c._count.crop,
      earliestYear: c._min.year,
      latestYear: c._max.year,
    })),
    aiProviders: {
      gemini: { configured: !!process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL ?? null },
      groq: { configured: !!process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL ?? null },
      local: localLlm,
    },
  });
});
