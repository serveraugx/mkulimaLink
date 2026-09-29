'use client';

import { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import api from '@/lib/api';

type ListingStatus = 'ACTIVE' | 'SOLD_OUT' | 'CLOSED';

interface Listing {
  id: string;
  quantityKg: number;
  pricePerKg: number;
  currency: string;
  status: ListingStatus;
}

const STATUS_LABEL: Record<ListingStatus, string> = {
  ACTIVE: 'Listed — visible to buyers',
  SOLD_OUT: 'Sold out — hidden from buyers',
  CLOSED: 'Not listed',
};

export default function SellProducePanel({ farmId }: { farmId: string }) {
  const [listing, setListing] = useState<Listing | null | undefined>(undefined); // undefined = loading
  const [quantityKg, setQuantityKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`/farms/${farmId}/listing`)
      .then((res) => {
        setListing(res.data.data);
        if (res.data.data) {
          setQuantityKg(String(res.data.data.quantityKg));
          setPricePerKg(String(res.data.data.pricePerKg));
        }
      })
      .catch(() => setListing(null));
  }, [farmId]);

  async function save(status: ListingStatus) {
    setError(null);
    setSaving(true);
    try {
      const res = await api.put(`/farms/${farmId}/listing`, {
        quantityKg: Number(quantityKg),
        pricePerKg: Number(pricePerKg),
        status,
      });
      setListing(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save listing');
    } finally {
      setSaving(false);
    }
  }

  if (listing === undefined) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
        <Store size={18} /> Sell This Harvest
      </h3>
      {listing && (
        <p
          className={`mb-3 text-sm ${listing.status === 'ACTIVE' ? 'text-green-400' : 'text-slate-500'}`}
        >
          {STATUS_LABEL[listing.status]}
        </p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Quantity available (kg)</label>
          <input
            type="number"
            min="1"
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            placeholder="500"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Asking price / kg (TZS)</label>
          <input
            type="number"
            min="1"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
            placeholder="650"
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => save('ACTIVE')}
          disabled={saving || !quantityKg || !pricePerKg}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60"
        >
          {listing?.status === 'ACTIVE' ? 'Update Listing' : 'List for Sale'}
        </button>
        {listing?.status === 'ACTIVE' && (
          <>
            <button
              onClick={() => save('SOLD_OUT')}
              disabled={saving}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-60"
            >
              Mark Sold Out
            </button>
            <button
              onClick={() => save('CLOSED')}
              disabled={saving}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-60"
            >
              Remove Listing
            </button>
          </>
        )}
      </div>
      <p className="mt-3 text-xs text-slate-600">
        Buyers browsing this crop in Market Explorer will see your farm, distance, quantity and price, and can
        send an interest request.
      </p>
    </div>
  );
}
