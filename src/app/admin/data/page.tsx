'use client';

import { useEffect, useState } from 'react';
import { Database, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS } from '@/types/farm';

interface DataInfo {
  marketPrices: Array<{ commodity: string; rows: number; earliest: string | null; latest: string | null }>;
  faostat: Array<{ crop: string; rows: number; earliestYear: number | null; latestYear: number | null }>;
  aiProviders: {
    gemini: { configured: boolean; model: string | null };
    groq: { configured: boolean; model: string | null };
    local: { configured: boolean; reachable: boolean; models: string[] };
  };
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
        ok ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-slate-600 bg-slate-800 text-slate-500'
      }`}
    >
      {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {label}
    </span>
  );
}

export default function AdminDataPage() {
  const [data, setData] = useState<DataInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/admin/data')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load data info'));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center gap-2">
        <Database className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Data Sources</h1>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h2 className="mb-1 font-semibold text-white">Market Prices (WFP)</h2>
        <p className="mb-3 text-xs text-slate-500">
          public/data/raw/wfp_food_prices_tza.csv — ingested via prisma/seed.ts
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-500">
              <th className="pb-2">Commodity</th>
              <th className="pb-2 text-right">Rows</th>
              <th className="pb-2 text-right">Earliest</th>
              <th className="pb-2 text-right">Latest</th>
            </tr>
          </thead>
          <tbody>
            {data.marketPrices.map((m) => (
              <tr key={m.commodity} className="border-t border-slate-700/50">
                <td className="py-2 text-slate-200">{CROP_LABELS[m.commodity as keyof typeof CROP_LABELS] ?? m.commodity}</td>
                <td className="py-2 text-right text-slate-400">{m.rows.toLocaleString()}</td>
                <td className="py-2 text-right text-slate-500">{m.earliest ?? '—'}</td>
                <td className="py-2 text-right text-slate-500">{m.latest ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.marketPrices.some((m) => m.commodity === 'CASSAVA') && (
          <p className="mt-2 text-xs text-slate-600">No Cassava row — WFP has no Tanzania price series for it.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h2 className="mb-1 font-semibold text-white">National Crop Stats (FAOSTAT)</h2>
        <p className="mb-3 text-xs text-slate-500">
          public/data/raw/FAOSTAT_data_en_9-28-2026.csv — ingested via prisma/seed.ts
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-500">
              <th className="pb-2">Crop</th>
              <th className="pb-2 text-right">Rows</th>
              <th className="pb-2 text-right">Year Range</th>
            </tr>
          </thead>
          <tbody>
            {data.faostat.map((f) => (
              <tr key={f.crop} className="border-t border-slate-700/50">
                <td className="py-2 text-slate-200">{CROP_LABELS[f.crop as keyof typeof CROP_LABELS] ?? f.crop}</td>
                <td className="py-2 text-right text-slate-400">{f.rows}</td>
                <td className="py-2 text-right text-slate-500">
                  {f.earliestYear}–{f.latestYear}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-white">
          <Sparkles size={18} /> AI Provider Chain
        </h2>
        <p className="mb-3 text-xs text-slate-500">Tried in order: Gemini → Groq → local LM Studio.</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-slate-700 p-3">
            <span className="text-slate-200">1. Gemini{data.aiProviders.gemini.model ? ` (${data.aiProviders.gemini.model})` : ''}</span>
            <StatusPill ok={data.aiProviders.gemini.configured} label={data.aiProviders.gemini.configured ? 'Configured' : 'Not configured'} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-700 p-3">
            <span className="text-slate-200">2. Groq{data.aiProviders.groq.model ? ` (${data.aiProviders.groq.model})` : ''}</span>
            <StatusPill ok={data.aiProviders.groq.configured} label={data.aiProviders.groq.configured ? 'Configured' : 'Not configured'} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-700 p-3">
            <span className="text-slate-200">
              3. Local LLM{data.aiProviders.local.models.length > 0 ? ` (${data.aiProviders.local.models.join(', ')})` : ''}
            </span>
            <div className="flex gap-2">
              <StatusPill ok={data.aiProviders.local.configured} label={data.aiProviders.local.configured ? 'Configured' : 'Not configured'} />
              {data.aiProviders.local.configured && (
                <StatusPill ok={data.aiProviders.local.reachable} label={data.aiProviders.local.reachable ? 'Reachable now' : 'Unreachable now'} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
