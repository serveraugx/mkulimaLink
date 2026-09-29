import type { Metadata } from 'next';
import Link from 'next/link';
import { Sprout, Satellite, MessageSquareText, TrendingUp, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mkulima Link | Smart Agriculture for Food Security',
  description: 'AI, Satellite, and Market intelligence for Tanzanian farmers.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold text-white">
          <Sprout size={24} className="text-emerald-500" />
          <span className="text-xl tracking-tight">Mkulima Link</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white">
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pb-20 pt-32 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900"></div>
        <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Empowering farmers with <span className="text-emerald-500">satellite</span> &{' '}
          <span className="text-emerald-500">market AI</span>.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
          Mkulima Link bridges the gap between rural smallholder farmers and modern agronomic intelligence. 
          Real-time weather, Sentinel-2 crop health, and live WFP market prices—delivered offline via SMS.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-full bg-emerald-600 px-8 py-4 font-semibold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
          >
            Enter Platform
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-slate-700 bg-slate-800 px-8 py-4 font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            Demo Accounts
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-slate-500">
          Demo: <span className="font-mono text-slate-300">juma@mkulima.demo</span> (Farmer) or <span className="font-mono text-slate-300">amina@mkulima.demo</span> (Buyer)
        </p>
      </section>

      {/* Features Grid */}
      <section className="border-t border-slate-800 bg-slate-900/50 px-8 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white">Built for Challenge 08: Agritech</h2>
            <p className="mt-4 text-slate-400">Addressing market-access and yield decisions in low-connectivity environments.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-500/50 hover:bg-slate-800">
              <div className="mb-4 inline-flex rounded-lg bg-emerald-500/10 p-3 text-emerald-400">
                <Satellite size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Copernicus Satellite</h3>
              <p className="text-sm text-slate-400">
                Live NDVI vegetation indexing from Sentinel-2 satellites to track exact crop health trajectories without physical sensors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-500/50 hover:bg-slate-800">
              <div className="mb-4 inline-flex rounded-lg bg-blue-500/10 p-3 text-blue-400">
                <TrendingUp size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">WFP Market Prices</h3>
              <p className="text-sm text-slate-400">
                Real-time ingestion of UN World Food Programme data. Farmers see the exact premium their listing has versus the nearest spot market.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-500/50 hover:bg-slate-800">
              <div className="mb-4 inline-flex rounded-lg bg-orange-500/10 p-3 text-orange-400">
                <MessageSquareText size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Offline AI Advisories</h3>
              <p className="text-sm text-slate-400">
                Designed for rural use. The Gemini-powered Decision Engine synthesizes complex data into a simple Swahili SMS via Briq.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-500/50 hover:bg-slate-800">
              <div className="mb-4 inline-flex rounded-lg bg-purple-500/10 p-3 text-purple-400">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Vision AI Disease Check</h3>
              <p className="text-sm text-slate-400">
                Farmers upload a photo of a sick plant; the platform cascade-routes it through Vision models for an instant Swahili diagnosis and remedy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
