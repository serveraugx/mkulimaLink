'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sprout, MapPin, User as UserIcon, Inbox, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/dashboard', label: 'My Farms', icon: Sprout },
  { href: '/dashboard/farms/new', label: 'Add Farm', icon: MapPin },
  { href: '/dashboard/requests', label: 'Requests', icon: Inbox },
  { href: '/dashboard/profile', label: 'Profile', icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api
      .get('/interests')
      .then((res) => setPendingCount(res.data.data.filter((i: { status: string }) => i.status === 'PENDING').length))
      .catch(() => {});
  }, []);

  async function signOut() {
    await api.post('/auth/logout');
    clearAuth();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="flex w-64 flex-col border-r border-slate-700 bg-slate-900">
      <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-6">
        <Sprout className="text-emerald-500" size={22} />
        <span className="text-xl font-bold text-white tracking-tight">Mkulima Link</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              {label}
              {href === '/dashboard/requests' && pendingCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        {user && <p className="mb-2 truncate px-3 text-xs text-slate-500">{user.name}</p>}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
