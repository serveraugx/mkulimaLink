'use client';

import { useEffect, useState } from 'react';
import { Inbox, Phone, Check, X } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS } from '@/types/farm';

type InterestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

interface InterestRow {
  id: string;
  status: InterestStatus;
  message: string | null;
  createdAt: string;
  buyer: { name: string; region: string | null; phone: string | null };
  listing: { quantityKg: number; pricePerKg: number; currency: string; farmName: string; crop: string };
}

const STATUS_BADGE: Record<InterestStatus, string> = {
  PENDING: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  ACCEPTED: 'border-green-500/30 bg-green-500/10 text-green-400',
  DECLINED: 'border-slate-600 bg-slate-800 text-slate-500',
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<InterestRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  function load() {
    api
      .get('/interests')
      .then((res) => setRequests(res.data.data))
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load requests'));
  }

  useEffect(load, []);

  async function respond(id: string, status: 'ACCEPTED' | 'DECLINED') {
    setActingOn(id);
    try {
      await api.patch(`/interests/${id}`, { status });
      load();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to update request');
    } finally {
      setActingOn(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-2">
        <Inbox className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Buyer Requests</h1>
      </div>

      {error && <p className="mb-4 text-red-400">{error}</p>}
      {!requests && !error && <p className="text-slate-400">Loading…</p>}
      {requests && requests.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          <Inbox className="mx-auto mb-3 text-slate-600" size={32} />
          <p>No buyer requests yet. List produce on a farm to start getting them.</p>
        </div>
      )}

      <div className="space-y-4">
        {requests?.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="font-semibold text-white">{r.buyer.name}</p>
                <p className="text-sm text-slate-500">{r.buyer.region ?? 'Region not set'}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${STATUS_BADGE[r.status]}`}>
                {r.status}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              Wants {r.listing.quantityKg}kg of {CROP_LABELS[r.listing.crop as keyof typeof CROP_LABELS]} from{' '}
              <span className="text-white">{r.listing.farmName}</span> — {r.listing.pricePerKg.toLocaleString()}{' '}
              {r.listing.currency}/kg listed price
            </p>
            {r.message && <p className="mt-1 text-sm italic text-slate-500">&ldquo;{r.message}&rdquo;</p>}

            {r.status === 'ACCEPTED' && r.buyer.phone && (
              <p className="mt-3 flex items-center gap-2 text-sm text-green-400">
                <Phone size={14} /> {r.buyer.phone}
              </p>
            )}

            {r.status === 'PENDING' && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => respond(r.id, 'ACCEPTED')}
                  disabled={actingOn === r.id}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60"
                >
                  <Check size={14} /> Accept
                </button>
                <button
                  onClick={() => respond(r.id, 'DECLINED')}
                  disabled={actingOn === r.id}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-60"
                >
                  <X size={14} /> Decline
                </button>
              </div>
            )}
            <p className="mt-2 text-xs text-slate-600">{new Date(r.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
