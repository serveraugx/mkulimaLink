'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Users, Leaf, ShieldCheck, Loader2 } from 'lucide-react';
import api from '@/lib/api';

type Direction = 'improving' | 'declining' | 'stable' | 'unknown';
type Severity = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

interface ImpactData {
  marketOpportunity: {
    listingPricePerKg: number | null;
    nearestMarketPricePerKg: number | null;
    premiumPercent: number | null;
    nearestMarket: string | null;
    currency: string;
  };
  ndviTrend: {
    latest: number | null;
    previous: number | null;
    deltaPercent: number | null;
    direction: Direction;
  };
  buyerEngagement: {
    totalInterests: number;
    accepted: number;
    pending: number;
    hasListing: boolean;
  };
  diseaseDetected: {
    lastSeverity: Severity | null;
    checksTotal: number;
  };
}

const SEVERITY_COLOR: Record<Severity, string> = {
  NONE: 'text-green-400',
  LOW: 'text-yellow-400',
  MODERATE: 'text-orange-400',
  HIGH: 'text-red-400',
  CRITICAL: 'text-red-300',
};

const DIRECTION_META: Record<Direction, { icon: typeof TrendingUp; color: string; label: string }> = {
  improving: { icon: TrendingUp, color: 'text-green-400', label: 'Improving' },
  declining: { icon: TrendingDown, color: 'text-red-400', label: 'Declining' },
  stable: { icon: Minus, color: 'text-slate-400', label: 'Stable' },
  unknown: { icon: Minus, color: 'text-slate-500', label: 'No data yet' },
};

export default function ImpactCard({ farmId }: { farmId: string }) {
  const [data, setData] = useState<ImpactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/farms/${farmId}/impact`)
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [farmId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 p-5 text-sm text-slate-400">
        <Loader2 size={16} className="animate-spin" /> Loading impact metrics…
      </div>
    );
  }

  if (!data) return null;

  const { marketOpportunity: mo, ndviTrend: ndvi, buyerEngagement: be, diseaseDetected: dd } = data;
  const DirIcon = DIRECTION_META[ndvi.direction].icon;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
          ↑
        </span>
        <h3 className="font-semibold text-white">Impact Metrics</h3>
        <span className="ml-auto rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
          Live data
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Market opportunity */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp size={12} /> Market Opportunity
          </div>
          {mo.listingPricePerKg !== null && mo.nearestMarketPricePerKg !== null ? (
            <>
              <p
                className={`text-xl font-bold ${
                  (mo.premiumPercent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {(mo.premiumPercent ?? 0) >= 0 ? '+' : ''}
                {mo.premiumPercent}%
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                vs WFP spot ({mo.nearestMarketPricePerKg.toLocaleString()} {mo.currency}/kg
                {mo.nearestMarket ? ` · ${mo.nearestMarket}` : ''})
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Your listing:{' '}
                <span className="text-white">
                  {mo.listingPricePerKg.toLocaleString()} {mo.currency}/kg
                </span>
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              {!be.hasListing ? (
                <>
                  Add a listing to
                  <br />
                  track price position
                </>
              ) : (
                'No WFP price data for this crop'
              )}
            </p>
          )}
        </div>

        {/* Crop health (NDVI) */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Leaf size={12} /> Crop Health (NDVI)
          </div>
          {ndvi.latest !== null ? (
            <>
              <p className={`text-xl font-bold ${DIRECTION_META[ndvi.direction].color}`}>
                {ndvi.latest.toFixed(3)}
              </p>
              <div
                className={`mt-0.5 flex items-center gap-1 text-xs ${DIRECTION_META[ndvi.direction].color}`}
              >
                <DirIcon size={12} />
                {DIRECTION_META[ndvi.direction].label}
                {ndvi.deltaPercent !== null && (
                  <span className="text-slate-400">
                    ({ndvi.deltaPercent >= 0 ? '+' : ''}
                    {ndvi.deltaPercent}% over period)
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">Copernicus Sentinel-2</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              Open farm → Satellite
              <br />
              to compute NDVI
            </p>
          )}
        </div>

        {/* Buyer engagement */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={12} /> Buyer Contacts
          </div>
          <p className="text-xl font-bold text-white">{be.totalInterests}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {be.accepted} accepted · {be.pending} pending
          </p>
          {!be.hasListing && (
            <p className="mt-1 text-xs text-slate-500">List produce to attract buyers</p>
          )}
        </div>

        {/* Disease monitoring */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={12} /> Disease Monitoring
          </div>
          <p
            className={`text-xl font-bold ${
              dd.lastSeverity ? SEVERITY_COLOR[dd.lastSeverity] : 'text-slate-400'
            }`}
          >
            {dd.lastSeverity ?? 'N/A'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {dd.checksTotal} check{dd.checksTotal !== 1 ? 's' : ''} run
          </p>
          {dd.checksTotal === 0 && (
            <p className="mt-1 text-xs text-slate-500">Use &ldquo;Check Plant&rdquo; above</p>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-600">
        Computed from real WFP market prices, Copernicus NDVI, and your marketplace activity.
      </p>
    </div>
  );
}
