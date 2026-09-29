'use client';

import { useEffect, useState } from 'react';
import { Leaf, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '@/lib/api';

interface NdviData {
  available: boolean;
  meanNdvi?: number;
  minNdvi?: number;
  maxNdvi?: number;
  validPixelPercent?: number;
  periodStart?: string;
  periodEnd?: string;
  previousMeanNdvi?: number;
  trend?: 'up' | 'down' | 'flat' | 'unknown';
  fromCache?: boolean;
  message?: string;
}

function health(mean: number): { label: string; color: string } {
  if (mean >= 0.6) return { label: 'Dense, healthy vegetation', color: 'text-green-400' };
  if (mean >= 0.4) return { label: 'Moderate vegetation', color: 'text-lime-400' };
  if (mean >= 0.2) return { label: 'Sparse vegetation', color: 'text-amber-400' };
  return { label: 'Little to no vegetation', color: 'text-red-400' };
}

export default function NdviCard({ farmId }: { farmId: string }) {
  const [ndvi, setNdvi] = useState<NdviData | null>(null);

  useEffect(() => {
    api
      .get(`/farms/${farmId}/ndvi`, { timeout: 25000 })
      .then((res) => setNdvi(res.data.data))
      .catch(() => setNdvi({ available: false, message: 'Failed to load NDVI data.' }));
  }, [farmId]);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
        <Leaf size={18} /> Vegetation Health (NDVI)
      </h3>
      {ndvi === null && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-green-500" />
          Computing NDVI from Sentinel-2 bands…
        </p>
      )}
      {ndvi && !ndvi.available && <p className="text-sm text-slate-500">{ndvi.message}</p>}
      {ndvi?.available && ndvi.meanNdvi !== undefined && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-slate-500 text-sm">Mean NDVI</p>
              <p className={`text-2xl font-bold ${health(ndvi.meanNdvi).color}`}>{ndvi.meanNdvi.toFixed(3)}</p>
              <p className={`text-sm ${health(ndvi.meanNdvi).color}`}>{health(ndvi.meanNdvi).label}</p>
            </div>
            {ndvi.trend && ndvi.trend !== 'unknown' && ndvi.previousMeanNdvi !== undefined && (
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2 text-sm">
                {ndvi.trend === 'up' && <TrendingUp size={16} className="text-green-400" />}
                {ndvi.trend === 'down' && <TrendingDown size={16} className="text-red-400" />}
                {ndvi.trend === 'flat' && <Minus size={16} className="text-slate-400" />}
                <span className="text-slate-300">
                  {ndvi.previousMeanNdvi.toFixed(3)} → {ndvi.meanNdvi.toFixed(3)}
                  {ndvi.trend === 'up' && ' — improving'}
                  {ndvi.trend === 'down' && ' — declining'}
                  {ndvi.trend === 'flat' && ' — stable'}
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Min</p>
              <p className="text-white">{ndvi.minNdvi?.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-slate-500">Max</p>
              <p className="text-white">{ndvi.maxNdvi?.toFixed(3)}</p>
            </div>
            <div>
              <p className="text-slate-500">Usable pixels</p>
              <p className="text-white">{ndvi.validPixelPercent}%</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Computed server-side from real Sentinel-2 L2A bands ({ndvi.periodStart} to {ndvi.periodEnd}, least-cloudy
            composite) via the Copernicus Data Space Ecosystem&rsquo;s Statistical API, over a ~300m box around this
            farm&rsquo;s saved coordinate — not its exact plot boundary. {ndvi.fromCache ? 'Showing a cached reading (recomputed at most once per day to conserve free quota).' : 'Freshly computed just now.'}
          </p>
        </>
      )}
    </div>
  );
}
