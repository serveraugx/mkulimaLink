'use client';

import { useEffect, useState } from 'react';
import { Satellite, Cloud } from 'lucide-react';
import api from '@/lib/api';

interface SatellitePass {
  available: boolean;
  date?: string;
  cloudCoverPercent?: number;
  vegetationPercent?: number;
  thumbnailUrl?: string;
  satellite?: string;
  message?: string;
}

export default function SatelliteCard({ farmId }: { farmId: string }) {
  const [pass, setPass] = useState<SatellitePass | null>(null);

  useEffect(() => {
    api
      .get(`/farms/${farmId}/satellite`)
      .then((res) => setPass(res.data.data))
      .catch(() => setPass({ available: false, message: 'Failed to load satellite data.' }));
  }, [farmId]);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
        <Satellite size={18} /> Satellite Coverage
      </h3>
      {pass === null && (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-green-500" />
          Checking Copernicus catalog…
        </p>
      )}
      {pass && !pass.available && <p className="text-sm text-slate-500">{pass.message}</p>}
      {pass?.available && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            {pass.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/farms/${farmId}/satellite/thumbnail`}
                alt={`Sentinel-2 quicklook, ${pass.date}`}
                className="h-32 w-32 shrink-0 rounded-lg border border-slate-700 object-cover"
              />
            )}
            <div className="grid flex-1 grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Last usable pass</p>
                <p className="text-lg font-semibold text-white">{pass.date}</p>
              </div>
              <div>
                <p className="text-slate-500">Cloud cover</p>
                <p className="flex items-center gap-1 text-lg font-semibold text-white">
                  <Cloud size={16} className="text-slate-500" /> {pass.cloudCoverPercent}%
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">Satellite</p>
                <p className="text-white">{pass.satellite}</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Real Sentinel-2 imagery via the Copernicus Data Space Ecosystem&rsquo;s public catalog — the
            least-cloudy pass in the last 45 days, region-wide (not zoomed to this plot). This is coverage
            visibility, not a vegetation-health score — see the NDVI card below for the computed value.
          </p>
        </>
      )}
    </div>
  );
}
