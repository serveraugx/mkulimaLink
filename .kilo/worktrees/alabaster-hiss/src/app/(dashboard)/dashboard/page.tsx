import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard Overview</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total Users', value: '12,430', delta: '+5.2%' },
          { label: 'Revenue', value: '$48,295', delta: '+12.1%' },
          { label: 'Active Sessions', value: '3,842', delta: '-2.4%' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-700 bg-slate-800 p-6"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-white">{stat.value}</p>
            <p
              className={`mt-1 text-sm ${stat.delta.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}
            >
              {stat.delta} vs last month
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard/settings" className="text-blue-400 hover:text-blue-300">
                → Account Settings
              </Link>
            </li>
            <li>
              <Link href="/dashboard/analytics" className="text-blue-400 hover:text-blue-300">
                → Analytics
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
