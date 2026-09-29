'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sprout, LogOut, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export interface SimpleShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export default function SimpleShell({
  label,
  navItems,
  children,
}: {
  label: string;
  navItems?: SimpleShellNavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user || checked) return;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.data, 'session'))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [user, checked, setUser]);

  async function signOut() {
    await api.post('/auth/logout');
    clearAuth();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="flex h-16 items-center justify-between border-b border-slate-700 px-8">
        <div className="flex items-center gap-2">
          <Sprout className="text-emerald-500" size={22} />
          <span className="text-xl font-bold text-white tracking-tight">Mkulima Link</span>
          <span className="ml-2 rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-slate-400">{user.name}</span>}
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>
      {navItems && navItems.length > 0 && (
        <nav className="flex gap-1 border-b border-slate-700 px-8">
          {navItems.map(({ href, label: navLabel, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-green-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-white'
                )}
              >
                <Icon size={16} />
                {navLabel}
              </Link>
            );
          })}
        </nav>
      )}
      <main className="p-8">{children}</main>
    </div>
  );
}
