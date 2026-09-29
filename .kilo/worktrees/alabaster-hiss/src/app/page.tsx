import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to MyApp — your production-ready Next.js starter.',
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">Welcome to MyApp</h1>
        <p className="mb-8 text-lg text-slate-400">
          A production-ready Next.js 14 starter with TypeScript, Tailwind CSS, and Zustand.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/api/health"
            className="rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition hover:border-slate-400"
          >
            API Health
          </Link>
        </div>
      </div>
    </main>
  );
}
