'use client';

import { useEffect, useState } from 'react';
import { Users, Search } from 'lucide-react';
import api from '@/lib/api';

type Role = 'FARMER' | 'BUYER' | 'ADMIN';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  region: string | null;
  createdAt: string;
  farmCount: number;
  interestsSent: number;
}

const ROLE_COLOR: Record<Role, string> = {
  FARMER: 'border-green-500/30 bg-green-500/10 text-green-400',
  BUYER: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  ADMIN: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [role, setRole] = useState<Role | 'ALL'>('ALL');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (role !== 'ALL') params.set('role', role);
    if (q.trim()) params.set('q', q.trim());
    const t = setTimeout(() => {
      api
        .get(`/admin/users?${params.toString()}`)
        .then((res) => setUsers(res.data.data))
        .catch((err) => setError(err.response?.data?.error ?? 'Failed to load users'));
    }, 250); // debounce search
    return () => clearTimeout(t);
  }, [role, q]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-2">
        <Users className="text-green-500" size={24} />
        <h1 className="text-2xl font-bold text-white">Users</h1>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email..."
            className="bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'FARMER', 'BUYER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                role === r
                  ? 'border-green-500 bg-green-600/20 text-white'
                  : 'border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400">{error}</p>}
      {users === null && !error && <p className="text-slate-400">Loading…</p>}
      {users && users.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
          No users match.
        </p>
      )}

      {users && users.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-500">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Region</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-right">Farms</th>
                <th className="p-3 text-right">Requests Sent</th>
                <th className="p-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-700/50 last:border-0">
                  <td className="p-3 text-slate-200">{u.name}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${ROLE_COLOR[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{u.region ?? '—'}</td>
                  <td className="p-3 text-slate-400">{u.phone ?? '—'}</td>
                  <td className="p-3 text-right text-slate-400">{u.farmCount}</td>
                  <td className="p-3 text-right text-slate-400">{u.interestsSent}</td>
                  <td className="p-3 text-right text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
