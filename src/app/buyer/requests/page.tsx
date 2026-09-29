'use client';

import { useEffect, useState } from 'react';
import { Send, Phone } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS } from '@/types/farm';

type InterestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

interface MyInterest {
  id: string;
  status: InterestStatus;
  createdAt: string;
  listing: { quantityKg: number; pricePerKg: number; currency: string; crop: string; farmName: string; status: string };
  farmer: { name: string; region: string | null; phone: string | null };
}

const STATUS_BADGE: Record<InterestStatus, string> = {
  PENDING: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  ACCEPTED: 'border-green-500/30 bg-green-500/10 text-green-400',
  DECLINED: 'border-slate-600 bg-slate-800 text-slate-500',
};

export default function BuyerRequestsPage() {
  const [requests, setRequests] = useState<MyInterest[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/buyer/interests')
      .then((res) => setRequests(res.data.data))
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load requests'));
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2">
        <Send className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">My Requests</h1>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {!requests && !error && <p className="text-slate-400">Loading…</p>}
      {requests && requests.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          <Send className="mx-auto mb-3 text-slate-600" size={32} />
          <p>You haven&rsquo;t sent any interest requests yet. Find a farmer in Market Explorer.</p>
        </div>
      )}

      <div className="space-y-4">
        {requests?.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-semibold text-white">{r.farmer.name}</p>
                <p className="text-sm text-slate-500">{r.farmer.region ?? 'Region not set'}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${STATUS_BADGE[r.status]}`}>
                {r.status}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {r.listing.quantityKg}kg of {CROP_LABELS[r.listing.crop as keyof typeof CROP_LABELS]} from{' '}
              <span className="text-white">{r.listing.farmName}</span> — {r.listing.pricePerKg.toLocaleString()}{' '}
              {r.listing.currency}/kg
            </p>

            {r.status === 'ACCEPTED' && r.farmer.phone && (
              <p className="mt-3 flex items-center gap-2 text-sm text-green-400">
                <Phone size={14} /> {r.farmer.phone}
              </p>
            )}
            {r.status === 'PENDING' && (
              <p className="mt-3 text-sm text-slate-500">Waiting for the farmer to respond.</p>
            )}
            {r.status === 'DECLINED' && <p className="mt-3 text-sm text-slate-500">The farmer declined this request.</p>}

            <p className="mt-2 text-xs text-slate-600">{new Date(r.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
