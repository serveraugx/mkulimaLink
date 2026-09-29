'use client';

import { useEffect, useState } from 'react';
import {
  Thermometer,
  CloudRain,
  Droplets,
  Mountain,
  Coins,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Pencil,
  Camera,
  MessageSquareText,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { CROP_LABELS } from '@/types/farm';
import type { FarmSummary } from '@/types/farm';
import StatCard from '@/components/farm/StatCard';
import RiskBadge from '@/components/farm/RiskBadge';
import AIChatPanel from '@/components/farm/AIChatPanel';
import SellProducePanel from '@/components/farm/SellProducePanel';
import ImpactCard from "@/components/farm/ImpactCard";
import SatelliteCard from '@/components/farm/SatelliteCard';
import NdviCard from '@/components/farm/NdviCard';

const STATUS_META = {
  good: { icon: CheckCircle2, label: 'ALL GOOD', tone: 'text-green-400 border-green-500/30 bg-green-500/10' },
  attention_required: {
    icon: AlertTriangle,
    label: 'ATTENTION',
    tone: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  },
  urgent: { icon: AlertTriangle, label: 'URGENT', tone: 'text-red-400 border-red-500/30 bg-red-500/10' },
};

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus, unknown: Minus };

export default function FarmDetailPage({ params }: { params: { id: string } }) {
  const [summary, setSummary] = useState<FarmSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [texting, setTexting] = useState(false);
  const [textResult, setTextResult] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/farms/${params.id}/summary`)
      .then((res) => setSummary(res.data.data))
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load farm data'));
  }, [params.id]);

  async function textMeStatus() {
    setTexting(true);
    setTextResult(null);
    try {
      const res = await api.post(`/farms/${params.id}/sms-status`, {});
      setTextResult(res.data.data.preview || 'SMS sent.');
    } catch (err: any) {
      const errData = err.response?.data?.error;
      setTextResult(typeof errData === 'string' ? errData : errData ? JSON.stringify(errData) : 'Failed to send SMS');
    } finally {
      setTexting(false);
    }
  }

  if (error) return <p className="text-red-400">{error}</p>;
  if (!summary) return <p className="text-slate-400">Loading farm intelligence…</p>;

  const { farm, weather, rainfall, soil, cropStage, market, nationalContext, decision } = summary;
  const status = STATUS_META[decision.overallStatus];
  const StatusIcon = status.icon;
  const TrendIcon = TREND_ICON[market.trend];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">{farm.name}</h1>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/farms/${farm.id}/disease-check`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
              >
                <Camera size={14} /> Check Plant
              </Link>
              <Link
                href={`/dashboard/farms/${farm.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
              >
                <Pencil size={14} /> Edit
              </Link>
              <button
                onClick={textMeStatus}
                disabled={texting}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-60"
              >
                <MessageSquareText size={14} /> {texting ? 'Sending…' : 'Text Me'}
              </button>
            </div>
          </div>
          {textResult && <p className="mt-1 text-xs text-slate-500">{textResult}</p>}
          <p className="text-slate-400">
            {CROP_LABELS[farm.crop]} · {farm.sizeHectares} hectares
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <span>
              Stage: <span className="font-medium text-white">{cropStage.currentStage.replace(/_/g, ' ')}</span>
            </span>
            <span>·</span>
            <span>Day {cropStage.daysAfterPlanting} after planting</span>
            {cropStage.nextStage && (
              <>
                <span>·</span>
                <span>
                  {cropStage.daysToNextStage}d to {cropStage.nextStage.replace(/_/g, ' ')}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={Thermometer}
            label="Weather"
            value={`${Math.round(weather.current.temperature)}°C`}
            sub={`${weather.current.humidity}% humidity`}
          />
          <StatCard
            icon={CloudRain}
            label="Rainfall"
            value={`${rainfall.anomalyPercent > 0 ? '+' : ''}${rainfall.anomalyPercent}%`}
            sub={rainfall.status.replace(/_/g, ' ')}
            tone={rainfall.status === 'normal' ? 'good' : rainfall.status === 'drought' ? 'danger' : 'warning'}
          />
          <StatCard
            icon={Mountain}
            label="Soil pH"
            value={soil.available && soil.ph !== undefined ? soil.ph.toFixed(1) : 'N/A'}
            sub={
              soil.available
                ? soil.approximated
                  ? `~${soil.distanceKm}km away`
                  : 'SoilGrids'
                : 'no data nearby'
            }
          />
          <StatCard
            icon={Coins}
            label="Market"
            value={market.nearest ? `${market.nearest.price.toLocaleString()} ${market.nearest.currency}` : 'N/A'}
            sub={market.nearest ? `/${market.nearest.unit} · ${market.nearest.market}` : undefined}
          />
        </div>

        {/* Overall status banner */}
        <div className={`rounded-xl border p-5 ${status.tone}`}>
          <div className="mb-2 flex items-center gap-2 font-bold">
            <StatusIcon size={20} />
            {status.label}
          </div>
          <ul className="space-y-1 text-sm text-slate-200">
            {decision.recommendations.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>

        {/* Risk badges */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            Weather risk <RiskBadge value={decision.weatherRisk} />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            Drought risk <RiskBadge value={decision.droughtRisk} />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            Market opportunity <RiskBadge value={decision.marketOpportunity} />
          </div>
        </div>

        {/* 7-day forecast */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-3 font-semibold text-white">7-Day Forecast</h3>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
            {weather.daily.map((d) => (
              <div key={d.date} className="text-center">
                <p className="text-xs text-slate-500">
                  {new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className="mt-1 text-sm font-medium text-white">{Math.round(d.tempMax)}°</p>
                <p className="text-xs text-slate-500">{Math.round(d.tempMin)}°</p>
                <p className="mt-1 text-xs text-blue-400">{d.precipitationProbability}%</p>
              </div>
            ))}
          </div>
          {weather.warnings.length > 0 && (
            <div className="mt-4 space-y-1">
              {weather.warnings.map((w, i) => (
                <p key={i} className="flex items-center gap-2 text-sm text-yellow-400">
                  <AlertTriangle size={14} /> {w}
                </p>
              ))}
            </div>
          )}
        </div>

        <SatelliteCard farmId={farm.id} />

        <NdviCard farmId={farm.id} />

        {/* Rainfall detail */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Droplets size={18} /> Rainfall Status
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-slate-500">Last 30 days</p>
              <p className="text-lg font-semibold text-white">{rainfall.last30DaysMm} mm</p>
            </div>
            <div>
              <p className="text-slate-500">Historical average</p>
              <p className="text-lg font-semibold text-white">{rainfall.historicalAverageMm} mm</p>
            </div>
            <div>
              <p className="text-slate-500">Anomaly</p>
              <p className="text-lg font-semibold text-white">
                {rainfall.anomalyPercent > 0 ? '+' : ''}
                {rainfall.anomalyPercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Soil detail */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Mountain size={18} /> Soil Profile
          </h3>
          {soil.available ? (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-slate-500">pH</p>
                  <p className="text-lg font-semibold text-white">{soil.ph?.toFixed(1) ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Clay</p>
                  <p className="text-lg font-semibold text-white">
                    {soil.clayPercent !== undefined ? `${soil.clayPercent}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Sand</p>
                  <p className="text-lg font-semibold text-white">
                    {soil.sandPercent !== undefined ? `${soil.sandPercent}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Organic Carbon</p>
                  <p className="text-lg font-semibold text-white">
                    {soil.organicCarbonPercent !== undefined ? `${soil.organicCarbonPercent}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Nitrogen</p>
                  <p className="text-lg font-semibold text-white">
                    {soil.nitrogenGKg !== undefined ? `${soil.nitrogenGKg} g/kg` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">CEC</p>
                  <p className="text-lg font-semibold text-white">
                    {soil.cecMmolKg !== undefined ? `${soil.cecMmolKg} mmol/kg` : 'N/A'}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                {soil.approximated
                  ? `SoilGrids had no data for this exact point (common right on coastlines) — this is from the nearest available pixel, ~${soil.distanceKm}km away.`
                  : 'SoilGrids, this exact coordinate.'}
              </p>
            </>
          ) : (
            <p className="text-slate-500">{soil.message ?? 'No soil data available for this location.'}</p>
          )}
        </div>

        {/* Market detail */}
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <Coins size={18} /> Market Prices — {CROP_LABELS[market.commodity]}
            <TrendIcon size={16} className="text-slate-400" />
          </h3>
          {market.nearest ? (
            <>
              <div className="mb-3 flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">
                  {market.nearest.price.toLocaleString()} {market.nearest.currency}
                </span>
                <span className="text-sm text-slate-500">/{market.nearest.unit} · {market.nearest.market}</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-2">Market</th>
                    <th className="pb-2">Distance</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {market.nearbyMarkets.map((m) => (
                    <tr key={m.market} className="border-t border-slate-700">
                      <td className="py-2 text-slate-200">{m.market}</td>
                      <td className="py-2 text-slate-500">{m.distanceKm} km</td>
                      <td className="py-2 capitalize text-slate-500">{m.priceType}</td>
                      <td className="py-2 text-right text-slate-200">
                        {m.price.toLocaleString()} {m.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-slate-600">
                Real WFP Tanzania food-price data (public/data/raw/wfp_food_prices_tza.csv), normalized to price
                per kg.
              </p>
            </>
          ) : (
            <p className="text-slate-500">No WFP price series for this commodity in Tanzania.</p>
          )}
        </div>
        <ImpactCard farmId={farm.id} />


        <SellProducePanel farmId={farm.id} />

        {/* National production context */}
        {nationalContext && (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
              <BarChart3 size={18} /> National Context — {nationalContext.year} (FAOSTAT)
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-slate-500">Tanzania production</p>
                <p className="text-lg font-semibold text-white">
                  {nationalContext.productionTonnes !== null
                    ? `${(nationalContext.productionTonnes / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k t`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Yield</p>
                <p className="text-lg font-semibold text-white">
                  {nationalContext.yieldKgPerHa !== null
                    ? `${nationalContext.yieldKgPerHa.toLocaleString()} kg/ha`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-slate-500">vs. prior year</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {nationalContext.productionTrend.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-[600px] lg:sticky lg:top-6">
        <AIChatPanel farmId={farm.id} />
      </div>
    </div>
  );
}
