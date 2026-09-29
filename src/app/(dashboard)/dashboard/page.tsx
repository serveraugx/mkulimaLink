'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Sprout } from 'lucide-react';
import api from '@/lib/api';
import { CROP_LABELS, type Farm } from '@/types/farm';
import RiskBadge from '@/components/farm/RiskBadge';

type OverallStatus = 'good' | 'attention_required' | 'urgent';

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[] | null>(null);
  const [statuses, setStatuses] = useState<Record<string, OverallStatus | 'loading' | 'error'>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/farms')
      .then((res) => {
        const list: Farm[] = res.data.data;
        setFarms(list);
        list.forEach((farm) => {
          setStatuses((s) => ({ ...s, [farm.id]: 'loading' }));
          api
            .get(`/farms/${farm.id}/status`)
            .then((r) => setStatuses((s) => ({ ...s, [farm.id]: r.data.data.overallStatus })))
            .catch(() => setStatuses((s) => ({ ...s, [farm.id]: 'error' })));
        });
      })
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load farms'));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Farms</h1>
        <Link
          href="/dashboard/farms/new"
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
        >
          <MapPin size={16} />
          Add Farm
        </Link>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {farms === null && !error && <p className="text-slate-400">Loading…</p>}

      {farms && farms.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
          <Sprout className="mx-auto mb-3 text-slate-600" size={32} />
          <p>No farms yet. Add your first farm to get weather, rainfall, soil and market intelligence.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {farms?.map((farm) => {
          const status = statuses[farm.id];
          return (
            <Link
              key={farm.id}
              href={`/dashboard/farms/${farm.id}`}
              className="rounded-xl border border-slate-700 bg-slate-800 p-5 transition hover:border-green-600"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-lg font-semibold text-white">{farm.name}</p>
                {status && status !== 'loading' && status !== 'error' && (
                  <RiskBadge value={status} label={status === 'good' ? 'ok' : undefined} />
                )}
              </div>
              <p className="text-sm text-slate-400">{CROP_LABELS[farm.crop]}</p>
              <p className="mt-2 text-sm text-slate-500">{farm.sizeHectares} hectares</p>
              <p className="text-xs text-slate-600">
                Planted {new Date(farm.plantingDate).toLocaleDateString()}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
