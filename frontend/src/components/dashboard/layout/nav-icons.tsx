import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { TruckIcon } from '@phosphor-icons/react/dist/ssr/Truck';
import { FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { UserGearIcon } from '@phosphor-icons/react/dist/ssr/UserGear';
import { WrenchIcon } from '@phosphor-icons/react/dist/ssr/Wrench';

export const navIcons = {
  'chart-pie': ChartPieIcon,   // Tableau de bord
  'truck': TruckIcon,          // Fournisseurs
  'file-text': FileTextIcon,   // Devis et Commandes
  'tag': TagIcon,              // Articles
  'package': PackageIcon,      // Stock
  'users': UsersIcon,          // Clients
  'user-gear': UserGearIcon,   // Employés
  'wrench': WrenchIcon         // Outils
} as Record<string, Icon>;
