'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const LocationMapPicker = dynamic(() => import('@/components/map/LocationMapPicker'), {
  ssr: false,
  loading: () => <div className="h-72 animate-pulse rounded-lg bg-slate-800" />,
});

export default function ProfileForm({
  showLocation = false,
  locationHint = 'Your location — used to center the map when adding a farm',
}: {
  showLocation?: boolean;
  locationHint?: string;
}) {
  const storedUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        const me = res.data.data;
        setName(me.name);
        setPhone(me.phone ?? '');
        setRegion(me.region ?? '');
        if (showLocation) {
          setLat(me.latitude ?? -6.1659);
          setLon(me.longitude ?? 39.2026);
        }
      })
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load profile'))
      .finally(() => setLoaded(true));
  }, [showLocation]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await api.patch('/auth/me', {
        name,
        phone: phone || undefined,
        region: region || undefined,
        ...(showLocation && lat !== null && lon !== null ? { latitude: lat, longitude: lon } : {}),
      });
      setUser(res.data.data, 'session');
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        <UserIcon className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm text-slate-400">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input
            disabled
            value={storedUser?.email ?? ''}
            className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+255…"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Region</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Zanzibar"
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        {showLocation && lat !== null && lon !== null && (
          <div>
            <label className="mb-1 flex items-center gap-1 text-sm text-slate-400">
              <MapPin size={14} /> {locationHint}
            </label>
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
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-green-400">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-green-600 py-2 font-semibold text-white transition hover:bg-green-500 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
