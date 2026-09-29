'use client';

import { ShoppingBasket, Send, Bell, User } from 'lucide-react';
import SimpleShell from '@/components/layout/SimpleShell';

const navItems = [
  { href: '/buyer', label: 'Market Explorer', icon: ShoppingBasket },
  { href: '/buyer/requests', label: 'My Requests', icon: Send },
  { href: '/buyer/alerts', label: 'Price Alerts', icon: Bell },
  { href: '/buyer/profile', label: 'Profile', icon: User },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SimpleShell label="Buyer" navItems={navItems}>
      {children}
    </SimpleShell>
  );
}
