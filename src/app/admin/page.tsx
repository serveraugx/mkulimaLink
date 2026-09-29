'use client';

import { useEffect, useState } from 'react';
import { Users, Sprout, Database, LayoutGrid, Store, Inbox } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS } from '@/types/farm';
import StatCard from '@/components/farm/StatCard';

interface AdminOverview {
  users: { farmers: number; buyers: number };
  marketplace: { activeListings: number; pendingInterests: number };
  farms: { total: number; byCrop: Array<{ crop: string; count: number }> };
  dataFreshness: {
    marketPriceRows: number;
    nationalStatRows: number;
    latestMarketDataDate: string | null;
    latestMarketDataSource: string | null;
  };
  recentFarms: Array<{
    id: string;
    name: string;
    crop: string;
    sizeHectares: number;
    region: string | null;
    ownerName: string;
    ownerEmail: string;
    createdAt: string;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/admin/overview')
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load admin overview'));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold text-white">Admin Overview</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users} label="Farmers" value={String(data.users.farmers)} />
        <StatCard icon={Users} label="Buyers" value={String(data.users.buyers)} />
        <StatCard icon={Sprout} label="Registered Farms" value={String(data.farms.total)} />
        <StatCard icon={Store} label="Active Listings" value={String(data.marketplace.activeListings)} />
        <StatCard icon={Inbox} label="Pending Requests" value={String(data.marketplace.pendingInterests)} />
        <StatCard
          icon={Database}
          label="Market Price Rows"
          value={data.dataFreshness.marketPriceRows.toLocaleString()}
          sub={
            data.dataFreshness.latestMarketDataDate
              ? `latest ${data.dataFreshness.latestMarketDataDate} (${data.dataFreshness.latestMarketDataSource})`
              : undefined
          }
        />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
          <LayoutGrid size={18} /> Farms by Crop
        </h3>
        {data.farms.byCrop.length === 0 ? (
          <p className="text-sm text-slate-500">No farms registered yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {data.farms.byCrop.map((c) => (
              <span
                key={c.crop}
                className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300"
              >
                {CROP_LABELS[c.crop as keyof typeof CROP_LABELS] ?? c.crop}: {c.count}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h3 className="mb-3 font-semibold text-white">Recent Farms</h3>
        {data.recentFarms.length === 0 ? (
          <p className="text-sm text-slate-500">No farms registered yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-500">
                <th className="pb-2">Farm</th>
                <th className="pb-2">Owner</th>
                <th className="pb-2">Crop</th>
                <th className="pb-2">Size</th>
                <th className="pb-2">Region</th>
              </tr>
            </thead>
            <tbody>
              {data.recentFarms.map((f) => (
                <tr key={f.id} className="border-b border-slate-700/50 last:border-0">
                  <td className="py-2 text-slate-200">{f.name}</td>
                  <td className="py-2 text-slate-400">
                    {f.ownerName} <span className="text-slate-600">({f.ownerEmail})</span>
                  </td>
                  <td className="py-2 text-slate-400">{CROP_LABELS[f.crop as keyof typeof CROP_LABELS] ?? f.crop}</td>
                  <td className="py-2 text-slate-400">{f.sizeHectares} ha</td>
                  <td className="py-2 text-slate-400">{f.region ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
