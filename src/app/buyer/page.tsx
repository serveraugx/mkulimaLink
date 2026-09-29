'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, ShoppingBasket, MapPin, Store, Send, Check, Clock } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS, type CropType } from '@/types/farm';
import BuyerAIChatPanel from '@/components/buyer/BuyerAIChatPanel';

interface MarketRow {
  market: string;
  region: string;
  distanceKm: number | null;
  price: number;
  unit: string;
  currency: string;
  priceType: string;
  date: string;
  trend: 'up' | 'down' | 'flat' | 'unknown';
}

interface ListingRow {
  listingId: string;
  farmName: string;
  farmerName: string;
  region: string | null;
  distanceKm: number | null;
  quantityKg: number;
  pricePerKg: number;
  currency: string;
  updatedAt: string;
  myInterestStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | null;
}

const TREND_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus, unknown: Minus };
const TREND_COLOR = { up: 'text-red-400', down: 'text-green-400', flat: 'text-slate-400', unknown: 'text-slate-500' };

export default function BuyerMarketExplorer() {
  const [crop, setCrop] = useState<CropType>('MAIZE');
  const [rows, setRows] = useState<MarketRow[] | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [listings, setListings] = useState<ListingRow[] | null>(null);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(null);
    setListings(null);
    setError(null);
    api
      .get(`/market/overview?crop=${crop}`)
      .then((res) => {
        setRows(res.data.data.markets);
        setHasLocation(res.data.data.hasLocation);
      })
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load market data'));
    api
      .get(`/market/listings?crop=${crop}`)
      .then((res) => setListings(res.data.data.listings))
      .catch(() => setListings([]));
  }, [crop]);

  async function sendInterest(listingId: string) {
    setSendingTo(listingId);
    try {
      await api.post(`/listings/${listingId}/interest`, {});
      setListings((prev) =>
        prev ? prev.map((l) => (l.listingId === listingId ? { ...l, myInterestStatus: 'PENDING' } : l)) : prev
      );
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to send request');
    } finally {
      setSendingTo(null);
    }
  }

  const sorted = rows ? [...rows].sort((a, b) => a.price - b.price) : null;

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
      <div className="mb-6 flex items-center gap-2">
        <ShoppingBasket className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Market Explorer</h1>
      </div>

      {!hasLocation && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-400">
          <MapPin size={16} className="shrink-0 text-slate-500" />
          <span>
            Set your location in{' '}
            <Link href="/buyer/profile" className="text-green-400 hover:text-green-300">
              Profile
            </Link>{' '}
            to see how far each market and farmer is from you.
          </span>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(CROP_LABELS).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setCrop(value as CropType)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              crop === value
                ? 'border-green-500 bg-green-600/20 text-white'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Farmers actually selling this crop right now */}
      <div className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
          <Store size={18} className="text-green-500" /> Farmers Selling {CROP_LABELS[crop]}
        </h2>
        {listings === null && <p className="text-sm text-slate-400">Loading…</p>}
        {listings && listings.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
            No farmers currently listing {CROP_LABELS[crop]} for sale.
          </p>
        )}
        {listings && listings.length > 0 && (
          <div className="space-y-3">
            {listings.map((l) => (
              <div
                key={l.listingId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4"
              >
                <div>
                  <p className="font-semibold text-white">
                    {l.farmerName} <span className="font-normal text-slate-500">· {l.farmName}</span>
                  </p>
                  <p className="text-sm text-slate-400">
                    {l.region ?? 'Region not set'}
                    {l.distanceKm !== null && ` · ${l.distanceKm} km away`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {l.quantityKg.toLocaleString()} kg @ {l.pricePerKg.toLocaleString()} {l.currency}/kg
                  </p>
                </div>
                {l.myInterestStatus === null && (
                  <button
                    onClick={() => sendInterest(l.listingId)}
                    disabled={sendingTo === l.listingId}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60"
                  >
                    <Send size={14} /> I&rsquo;m Interested
                  </button>
                )}
                {l.myInterestStatus === 'PENDING' && (
                  <span className="flex items-center gap-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-sm text-yellow-400">
                    <Clock size={14} /> Request Sent
                  </span>
                )}
                {l.myInterestStatus === 'ACCEPTED' && (
                  <span className="flex items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm text-green-400">
                    <Check size={14} /> Accepted — see My Requests
                  </span>
                )}
                {l.myInterestStatus === 'DECLINED' && (
                  <span className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-500">
                    Declined
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reference price data across markets */}
      <h2 className="mb-3 text-lg font-semibold text-white">Market Reference Prices</h2>
      <p className="mb-4 text-sm text-slate-400">
        Latest real prices across Tanzania markets, from WFP&rsquo;s food-price series — for context, not
        necessarily farmers you can contact directly.
      </p>

      {error && <p className="text-red-400">{error}</p>}
      {!rows && !error && <p className="text-slate-400">Loading…</p>}
      {rows && rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
          No WFP price series for {CROP_LABELS[crop]} in Tanzania.
        </p>
      )}

      {sorted && sorted.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-500">
                <th className="p-3">Market</th>
                <th className="p-3">Region</th>
                {hasLocation && <th className="p-3 text-right">Distance</th>}
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Price / kg</th>
                <th className="p-3 text-right">Trend</th>
                <th className="p-3 text-right">As of</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => {
                const TrendIcon = TREND_ICON[row.trend];
                return (
                  <tr key={row.market} className="border-b border-slate-700/50 last:border-0">
                    <td className="p-3 text-slate-200">{row.market}</td>
                    <td className="p-3 text-slate-500">{row.region}</td>
                    {hasLocation && (
                      <td className="p-3 text-right text-slate-500">
                        {row.distanceKm !== null ? `${row.distanceKm} km` : '—'}
                      </td>
                    )}
                    <td className="p-3 capitalize text-slate-500">{row.priceType}</td>
                    <td className="p-3 text-right font-semibold text-white">
                      {row.price.toLocaleString()} {row.currency}
                    </td>
                    <td className={`p-3 text-right ${TREND_COLOR[row.trend]}`}>
                      <TrendIcon size={16} className="ml-auto" />
                    </td>
                    <td className="p-3 text-right text-slate-500">{row.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>

      <div className="h-[600px] lg:sticky lg:top-6">
        <BuyerAIChatPanel crop={crop} />
      </div>
    </div>
  );
}
