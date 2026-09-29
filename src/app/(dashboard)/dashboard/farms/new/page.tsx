'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import FarmForm, { type FarmFormValues } from '@/components/farm/FarmForm';

const DEFAULT_LAT = -6.1659; // Zanzibar — used only if the farmer has no saved location yet
const DEFAULT_LON = 39.2026;

export default function NewFarmPage() {
  const router = useRouter();
  const [initial, setInitial] = useState<FarmFormValues>({
    name: '',
    crop: 'MAIZE',
    sizeHectares: '1',
    plantingDate: new Date().toISOString().slice(0, 10),
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
  });
  const [mapReady, setMapReady] = useState(false);

  // Resolve the farmer's own registered location BEFORE mounting the map
  // picker, so it centers there in one shot instead of jumping after load.
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        const me = res.data.data;
        if (me.latitude != null && me.longitude != null) {
          setInitial((v) => ({ ...v, lat: me.latitude, lon: me.longitude }));
        }
      })
      .catch(() => {})
      .finally(() => setMapReady(true));
  }, []);

  async function handleSubmit(values: FarmFormValues) {
    const res = await api.post('/farms', {
      name: values.name,
      crop: values.crop,
      sizeHectares: Number(values.sizeHectares),
      plantingDate: values.plantingDate,
      latitude: values.lat,
      longitude: values.lon,
    });
    router.push(`/dashboard/farms/${res.data.data.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Add Farm</h1>
      {mapReady ? (
        <FarmForm initial={initial} submitLabel="Save Farm" submittingLabel="Saving…" onSubmit={handleSubmit} />
      ) : (
        <div className="h-80 animate-pulse rounded-lg bg-slate-800" />
      )}
    </div>
  );
}
