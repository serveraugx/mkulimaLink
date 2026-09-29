/**
 * Centralized navigation links for the app.
 * Used by Sidebar, Header, and any nav component.
 */
export const NAV_LINKS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/settings', label: 'Settings' },
] as const;

export const AUTH_LINKS = [
  { href: '/login', label: 'Sign In' },
  { href: '/register', label: 'Create Account' },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
