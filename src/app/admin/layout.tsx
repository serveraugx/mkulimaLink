'use client';

import { LayoutDashboard, Users, Sprout, Store, Database } from 'lucide-react';
import SimpleShell from '@/components/layout/SimpleShell';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/farms', label: 'Farms', icon: Sprout },
  { href: '/admin/marketplace', label: 'Marketplace', icon: Store },
  { href: '/admin/data', label: 'Data', icon: Database },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SimpleShell label="Admin" navItems={navItems}>
      {children}
    </SimpleShell>
  );
}
