'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, Trash2, Plus } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS, type CropType } from '@/types/farm';

type Direction = 'BELOW' | 'ABOVE';

interface Alert {
  id: string;
  crop: CropType;
  targetPrice: number;
  direction: Direction;
  active: boolean;
  createdAt: string;
  currentCheapest: { price: number; market: string; currency: string } | null;
  triggered: boolean;
}

export default function BuyerAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [crop, setCrop] = useState<CropType>('MAIZE');
  const [direction, setDirection] = useState<Direction>('BELOW');
  const [targetPrice, setTargetPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    api
      .get('/buyer/alerts')
      .then((res) => setAlerts(res.data.data))
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load alerts'));
  }

  useEffect(load, []);

  async function createAlert(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.post('/buyer/alerts', { crop, direction, targetPrice: Number(targetPrice) });
      setTargetPrice('');
      load();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create alert');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(alert: Alert) {
    await api.patch(`/buyer/alerts/${alert.id}`, { active: !alert.active });
    load();
  }

  async function remove(id: string) {
    await api.delete(`/buyer/alerts/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-2 flex items-center gap-2">
        <Bell className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
      </div>
      <p className="mb-6 text-sm text-slate-500">
        A watchlist, not a push notification — there&rsquo;s no SMS/app-notification channel wired up, so check
        back here to see if a target has been hit.
      </p>

      <form onSubmit={createAlert} className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
        <h2 className="mb-3 font-semibold text-white">New Alert</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 block text-sm text-slate-400">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value as CropType)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
            >
              {Object.entries(CROP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">When price</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
            >
              <option value="BELOW">drops below</option>
              <option value="ABOVE">rises above</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 block text-sm text-slate-400">Target (TZS/kg)</label>
            <input
              type="number"
              min="1"
              required
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="600"
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
            />
          </div>
          <div className="col-span-2 flex items-end sm:col-span-1">
            <button
              type="submit"
              disabled={saving || !targetPrice}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </form>

      {alerts === null && <p className="text-slate-400">Loading…</p>}
      {alerts && alerts.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          <Bell className="mx-auto mb-3 text-slate-600" size={32} />
          <p>No alerts yet. Add one above.</p>
        </div>
      )}

      <div className="space-y-3">
        {alerts?.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border p-4 ${
              a.triggered ? 'border-green-500/40 bg-green-500/10' : 'border-slate-700 bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {a.triggered ? (
                  <BellRing size={18} className="text-green-400" />
                ) : (
                  <Bell size={18} className="text-slate-500" />
                )}
                <div>
                  <p className="font-semibold text-white">
                    {CROP_LABELS[a.crop]} — {a.direction === 'BELOW' ? 'below' : 'above'}{' '}
                    {a.targetPrice.toLocaleString()} TZS/kg
                  </p>
                  <p className="text-sm text-slate-500">
                    {a.currentCheapest
                      ? `Cheapest now: ${a.currentCheapest.price.toLocaleString()} ${a.currentCheapest.currency} at ${a.currentCheapest.market}`
                      : 'No market data for this crop'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {a.triggered && (
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-400">
                    TRIGGERED
                  </span>
                )}
                <button
                  onClick={() => toggleActive(a)}
                  className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:border-slate-500"
                >
                  {a.active ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => remove(a.id)}
                  className="rounded-lg border border-slate-600 p-1.5 text-slate-400 hover:border-red-500/40 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
