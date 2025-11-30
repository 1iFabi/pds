import React from 'react';
import { FileText, Database } from 'lucide-react';

export const analystNavItems = (isExpanded, isMobile, closeMenuAndNavigate) => [
  {
    href: '#',
    icon: <FileText size={20} className="admin-sidebar__nav-icon" />,
    label: 'Administrar reportes genéticos',
    title: 'Administrar reportes genéticos',
    onClick: closeMenuAndNavigate('/dashboard/admin/reports'),
    divider: true,
  },
  {
    href: '#ver-variantes',
    icon: <Database size={20} className="admin-sidebar__nav-icon" />,
    label: 'Ver variantes en base de datos',
    title: 'Ver variantes en base de datos',
    onClick: closeMenuAndNavigate('/dashboard/admin/variants'),
    divider: false,
  },
];
