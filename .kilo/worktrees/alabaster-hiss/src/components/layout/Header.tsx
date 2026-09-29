'use client';

import { Bell, Search, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-700 bg-slate-900 px-8">
      {/* Search */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
          <Bell size={20} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
          <User size={16} />
          <span>Account</span>
        </button>
      </div>
    </header>
  );
}
