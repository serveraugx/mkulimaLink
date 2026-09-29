'use client';

import { useEffect, useState } from 'react';
import { Sprout, Search } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS } from '@/types/farm';

interface AdminFarm {
  id: string;
  name: string;
  crop: string;
  sizeHectares: number;
  latitude: number;
  longitude: number;
  plantingDate: string;
  createdAt: string;
  owner: { name: string; email: string; region: string | null };
  listing: { status: 'ACTIVE' | 'SOLD_OUT' | 'CLOSED'; quantityKg: number; pricePerKg: number; currency: string } | null;
}

const LISTING_COLOR: Record<string, string> = {
  ACTIVE: 'border-green-500/30 bg-green-500/10 text-green-400',
  SOLD_OUT: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  CLOSED: 'border-slate-600 bg-slate-800 text-slate-500',
};

export default function AdminFarmsPage() {
  const [farms, setFarms] = useState<AdminFarm[] | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
      api
        .get(`/admin/farms${params}`)
        .then((res) => setFarms(res.data.data))
        .catch((err) => setError(err.response?.data?.error ?? 'Failed to load farms'));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-2">
        <Sprout className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Farms</h1>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
        <Search size={16} className="text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search farm, owner name or email..."
          className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {farms === null && !error && <p className="text-slate-400">Loading…</p>}
      {farms && farms.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
          No farms match.
        </p>
      )}

      {farms && farms.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-500">
                <th className="p-3">Farm</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Crop</th>
                <th className="p-3">Size</th>
                <th className="p-3">Region</th>
                <th className="p-3">Listing</th>
                <th className="p-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((f) => (
                <tr key={f.id} className="border-b border-slate-700/50 last:border-0">
                  <td className="p-3 text-slate-200">{f.name}</td>
                  <td className="p-3 text-slate-400">
                    {f.owner.name} <span className="text-slate-600">({f.owner.email})</span>
                  </td>
                  <td className="p-3 text-slate-400">{CROP_LABELS[f.crop as keyof typeof CROP_LABELS] ?? f.crop}</td>
                  <td className="p-3 text-slate-400">{f.sizeHectares} ha</td>
                  <td className="p-3 text-slate-400">{f.owner.region ?? '—'}</td>
                  <td className="p-3">
                    {f.listing ? (
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${LISTING_COLOR[f.listing.status]}`}>
                        {f.listing.status} · {f.listing.quantityKg}kg @ {f.listing.pricePerKg} {f.listing.currency}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right text-slate-500">{new Date(f.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
