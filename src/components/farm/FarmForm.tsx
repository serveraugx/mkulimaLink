'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { CROP_LABELS, type CropType } from '@/types/farm';

const LocationMapPicker = dynamic(() => import('@/components/map/LocationMapPicker'), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse rounded-lg bg-slate-800" />,
});

export interface FarmFormValues {
  name: string;
  crop: CropType;
  sizeHectares: string;
  plantingDate: string;
  lat: number;
  lon: number;
}

interface Props {
  /** Mount this component only once `initial` holds its real starting values — its fields are uncontrolled after first render. */
  initial: FarmFormValues;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: FarmFormValues) => Promise<void>;
  extraActions?: React.ReactNode;
}

export default function FarmForm({ initial, submitLabel, submittingLabel, onSubmit, extraActions }: Props) {
  const [name, setName] = useState(initial.name);
  const [crop, setCrop] = useState<CropType>(initial.crop);
  const [sizeHectares, setSizeHectares] = useState(initial.sizeHectares);
  const [plantingDate, setPlantingDate] = useState(initial.plantingDate);
  const [lat, setLat] = useState(initial.lat);
  const [lon, setLon] = useState(initial.lon);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({ name, crop, sizeHectares, plantingDate, lat, lon });
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm text-slate-400">Farm name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Shamba la Juma"
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Crop</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value as CropType)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
          >
            {Object.entries(CROP_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Farm size (hectares)</label>
          <input
            required
            type="number"
            step="0.1"
            min="0.1"
            value={sizeHectares}
            onChange={(e) => setSizeHectares(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Planting date</label>
        <input
          required
          type="date"
          value={plantingDate}
          onChange={(e) => setPlantingDate(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-400">Farm location — tap the map or drag the pin</label>
        <LocationMapPicker
          lat={lat}
          lon={lon}
          onChange={(newLat, newLon) => {
            setLat(newLat);
            setLon(newLon);
          }}
        />
        <p className="mt-1 text-xs text-slate-500">
          {lat.toFixed(4)}, {lon.toFixed(4)}
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-green-600 py-2 font-semibold text-white transition hover:bg-green-500 disabled:opacity-60"
        >
          {loading ? submittingLabel : submitLabel}
        </button>
        {extraActions}
      </div>
    </form>
  );
}
