'use client';

import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS } from '@/types/farm';

interface ListingRow {
  id: string;
  farmName: string;
  crop: string;
  ownerName: string;
  ownerEmail: string;
  quantityKg: number;
  pricePerKg: number;
  currency: string;
  status: 'ACTIVE' | 'SOLD_OUT' | 'CLOSED';
  interestCount: number;
  updatedAt: string;
}

interface InterestRow {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  buyerName: string;
  buyerEmail: string;
  farmerName: string;
  farmName: string;
  crop: string;
  createdAt: string;
}

const LISTING_COLOR: Record<string, string> = {
  ACTIVE: 'border-green-500/30 bg-green-500/10 text-green-400',
  SOLD_OUT: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  CLOSED: 'border-slate-600 bg-slate-800 text-slate-500',
};

const INTEREST_COLOR: Record<string, string> = {
  PENDING: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  ACCEPTED: 'border-green-500/30 bg-green-500/10 text-green-400',
  DECLINED: 'border-slate-600 bg-slate-800 text-slate-500',
};

export default function AdminMarketplacePage() {
  const [listings, setListings] = useState<ListingRow[] | null>(null);
  const [interests, setInterests] = useState<InterestRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/admin/marketplace')
      .then((res) => {
        setListings(res.data.data.listings);
        setInterests(res.data.data.interests);
      })
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load marketplace data'));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center gap-2">
        <Store className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Marketplace</h1>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-white">All Listings</h2>
        {listings === null && <p className="text-slate-400">Loading…</p>}
        {listings && listings.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
            No farms have listed produce yet.
          </p>
        )}
        {listings && listings.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-slate-500">
                  <th className="p-3">Farm</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3 text-right">Qty / Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Requests</th>
                  <th className="p-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} className="border-b border-slate-700/50 last:border-0">
                    <td className="p-3 text-slate-200">{l.farmName}</td>
                    <td className="p-3 text-slate-400">
                      {l.ownerName} <span className="text-slate-600">({l.ownerEmail})</span>
                    </td>
                    <td className="p-3 text-slate-400">{CROP_LABELS[l.crop as keyof typeof CROP_LABELS] ?? l.crop}</td>
                    <td className="p-3 text-right text-slate-400">
                      {l.quantityKg}kg @ {l.pricePerKg.toLocaleString()} {l.currency}
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${LISTING_COLOR[l.status]}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-400">{l.interestCount}</td>
                    <td className="p-3 text-right text-slate-500">{new Date(l.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-white">Recent Interest Requests</h2>
        {interests === null && <p className="text-slate-400">Loading…</p>}
        {interests && interests.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
            No buyer requests yet.
          </p>
        )}
        {interests && interests.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-slate-500">
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Farmer</th>
                  <th className="p-3">Farm / Crop</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Sent</th>
                </tr>
              </thead>
              <tbody>
                {interests.map((i) => (
                  <tr key={i.id} className="border-b border-slate-700/50 last:border-0">
                    <td className="p-3 text-slate-200">
                      {i.buyerName} <span className="text-slate-600">({i.buyerEmail})</span>
                    </td>
                    <td className="p-3 text-slate-400">{i.farmerName}</td>
                    <td className="p-3 text-slate-400">
                      {i.farmName} · {CROP_LABELS[i.crop as keyof typeof CROP_LABELS] ?? i.crop}
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${INTEREST_COLOR[i.status]}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500">{new Date(i.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
