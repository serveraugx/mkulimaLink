'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, Tractor, ShoppingBasket, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const LocationMapPicker = dynamic(() => import('@/components/map/LocationMapPicker'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-lg bg-slate-900" />,
});

type RegisterRole = 'FARMER' | 'BUYER';

const DEFAULT_LAT = -6.1659; // Zanzibar — just a starting map view, not submitted until the farmer pins their spot
const DEFAULT_LON = 39.2026;

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [role, setRole] = useState<RegisterRole>('FARMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('');
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lon, setLon] = useState(DEFAULT_LON);
  const [locationPinned, setLocationPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (role === 'FARMER' && !locationPinned) {
      setError('Tap the map to pin where your farm is before creating the account.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        region,
        role,
        ...(role === 'FARMER' ? { latitude: lat, longitude: lon } : {}),
      });
      setUser(res.data.data, 'session');
      router.push(role === 'FARMER' ? '/dashboard' : '/buyer');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-2">
          <Sprout className="text-green-500" size={28} />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="mb-1 block text-sm text-slate-400">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('FARMER')}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition',
                  role === 'FARMER'
                    ? 'border-green-500 bg-green-600/20 text-white'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                )}
              >
                <Tractor size={16} /> Farmer
              </button>
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={clsx(
                  'flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition',
                  role === 'BUYER'
                    ? 'border-green-500 bg-green-600/20 text-white'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                )}
              >
                <ShoppingBasket size={16} /> Buyer
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
              placeholder="Juma Hassan"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="region">
              Region
            </label>
            <input
              id="region"
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
              placeholder="Zanzibar"
            />
          </div>
          {role === 'FARMER' && (
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm text-slate-400">
                <MapPin size={14} /> Where is your farm? — tap the map to pin it
              </label>
              <LocationMapPicker
                lat={lat}
                lon={lon}
                onChange={(newLat, newLon) => {
                  setLat(newLat);
                  setLon(newLon);
                  setLocationPinned(true);
                }}
              />
              <p className="mt-1 text-xs text-slate-500">
                {locationPinned ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : 'Not pinned yet'}
              </p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-green-500 focus:outline-none"
              placeholder="Min 6 characters"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 py-2 font-semibold text-white transition hover:bg-green-500 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-green-400 hover:text-green-300">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
