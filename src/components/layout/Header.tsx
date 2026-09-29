'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (user || checked) return;
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.data, 'session'))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [user, checked, setUser]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-700 bg-slate-900 px-8">
      <span className="text-sm text-slate-400">Localized farming recommendations — no sensors required</span>
      <div className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300">
        <User size={16} />
        <span>{user?.name ?? 'Farmer'}</span>
      </div>
    </header>
  );
}
