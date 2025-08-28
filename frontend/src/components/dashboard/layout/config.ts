// lib/nav.ts
import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Tableau de bord', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'fournisseurs', title: 'Fournisseurs', href: paths.dashboard.fournisseurs, icon: 'truck' },
  { key: 'devis', title: 'Devis et Commandes', href: paths.dashboard.devis, icon: 'file-text' },
  { key: 'articles', title: 'Articles Vendus', href: paths.dashboard.articles, icon: 'tag' },
  { key: 'stock', title: 'Stock', href: paths.dashboard.stock, icon: 'package' },
  { key: 'clients', title: 'Clients', href: paths.dashboard.clients, icon: 'users' },
  { key: 'employes', title: 'Personnel', href: paths.dashboard.employes, icon: 'user-gear' },
  { key: 'outils', title: 'Outils', href: paths.dashboard.outils, icon: 'wrench' },
] satisfies NavItemConfig[];

// role -> allowed nav keys
const ROLE_ALLOWED_KEYS: Record<'admin' | 'manager' | 'stock', string[]> = {
  admin: navItems.map(i => i.key),
  manager: navItems.map(i => i.key),
  stock: ['stock', 'outils', 'fournisseurs'],
};

export function getNavItemsForRole(role?: string): NavItemConfig[] {
  if (!role) return [];
  const allowed = ROLE_ALLOWED_KEYS[role as keyof typeof ROLE_ALLOWED_KEYS];
  if (!allowed) return [];
  return navItems.filter(i => allowed.includes(i.key));
}
