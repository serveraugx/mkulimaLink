import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Analytics</h1>
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <p className="text-slate-400">Analytics charts will render here. Integrate Chart.js or Recharts.</p>
      </div>
    </div>
  );
}
