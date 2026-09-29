'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, ArrowLeft, AlertTriangle, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import MarkdownLite from '@/components/ui/MarkdownLite';

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.82;

/** Downscales and re-encodes the photo in the browser so uploads stay small and fast. */
function resizeImageToJpeg(file: File): Promise<{ base64: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve({ base64: dataUrl.split(',')[1], dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function DiseaseCheckPage({ params }: { params: { id: string } }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setAssessment(null);
    try {
      const { base64: b64, dataUrl } = await resizeImageToJpeg(file);
      setBase64(b64);
      setPreview(dataUrl);
    } catch {
      setError('Imeshindikana kusoma picha hiyo. Jaribu picha nyingine.');
    }
  }

  async function analyze() {
    if (!base64) return;
    setLoading(true);
    setError(null);
    setAssessment(null);
    try {
      // Vision analysis of a real photo can take well past the default 10s
      // client timeout — override it for this call specifically.
      const res = await api.post(
        `/farms/${params.id}/disease-check`,
        { imageBase64: base64, mimeType: 'image/jpeg' },
        { timeout: 45_000 }
      );
      if (res.data.data.available) {
        setAssessment(res.data.data.assessment);
      } else {
        setError(res.data.data.message ?? 'Haipatikani kwa sasa.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Hitilafu imetokea.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/dashboard/farms/${params.id}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={14} /> Back to farm
      </Link>

      <div className="mb-2 flex items-center gap-2">
        <Camera className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Plant Health Check</h1>
      </div>

      <div className="mb-6 flex gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>
          This gives an AI-assisted <strong>preliminary</strong> assessment only — it is not a certified
          diagnosis. For anything serious, consult your local agricultural extension officer.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800 p-8 text-center hover:border-green-600">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Selected plant photo" className="max-h-64 rounded-lg object-contain" />
          ) : (
            <>
              <Camera className="mb-2 text-slate-500" size={32} />
              <p className="text-sm text-slate-400">Tap to take or choose a photo of the leaf/plant</p>
            </>
          )}
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
        </label>

        <button
          onClick={analyze}
          disabled={!base64 || loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 font-semibold text-white transition hover:bg-green-500 disabled:opacity-60"
        >
          <Sparkles size={16} />
          {loading ? 'Inachambua…' : 'Chambua Picha'}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {assessment && (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <h3 className="mb-2 font-semibold text-white">Tathmini ya Awali</h3>
            <MarkdownLite text={assessment} className="space-y-1 text-sm text-slate-200" />
          </div>
        )}
      </div>
    </div>
  );
}
