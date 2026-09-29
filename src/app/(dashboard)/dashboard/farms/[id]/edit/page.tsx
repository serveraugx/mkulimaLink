'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import api from '@/lib/api';
import FarmForm, { type FarmFormValues } from '@/components/farm/FarmForm';
import type { Farm } from '@/types/farm';

export default function EditFarmPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [initial, setInitial] = useState<FarmFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get(`/farms/${params.id}`)
      .then((res) => {
        const farm: Farm = res.data.data;
        setInitial({
          name: farm.name,
          crop: farm.crop,
          sizeHectares: String(farm.sizeHectares),
          plantingDate: farm.plantingDate.slice(0, 10),
          lat: farm.latitude,
          lon: farm.longitude,
        });
      })
      .catch((err) => setError(err.response?.data?.error ?? 'Failed to load farm'));
  }, [params.id]);

  async function handleSubmit(values: FarmFormValues) {
    await api.patch(`/farms/${params.id}`, {
      name: values.name,
      crop: values.crop,
      sizeHectares: Number(values.sizeHectares),
      plantingDate: values.plantingDate,
      latitude: values.lat,
      longitude: values.lon,
    });
    router.push(`/dashboard/farms/${params.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm('Delete this farm? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/farms/${params.id}`);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to delete farm');
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Farm</h1>
      {error && <p className="mb-4 text-red-400">{error}</p>}
      {!initial && !error && <div className="h-80 animate-pulse rounded-lg bg-slate-800" />}
      {initial && (
        <FarmForm
          initial={initial}
          submitLabel="Save Changes"
          submittingLabel="Saving…"
          onSubmit={handleSubmit}
          extraActions={
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          }
        />
      )}
    </div>
  );
}
