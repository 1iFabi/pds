import React from 'react';
import { Home, Search, Beaker, History } from 'lucide-react';

export const receptionNavItems = (isExpanded, isMobile, closeMenuAndNavigate) => [
  {
    href: '/dashboard',
    icon: <Home size={20} className="admin-sidebar__nav-icon" />,
    label: 'Inicio',
    title: 'Inicio',
    onClick: closeMenuAndNavigate('/dashboard'),
    divider: true,
  },
  {
    href: '#buscar-usuario',
    icon: <Search size={20} className="admin-sidebar__nav-icon" />,
    label: 'Buscar usuario',
    title: 'Buscar usuario',
    onClick: closeMenuAndNavigate('/dashboard/reception/search'),
    divider: false,
  },
  {
    href: '#registrar-muestra',
    icon: <Beaker size={20} className="admin-sidebar__nav-icon" />,
    label: 'Registrar muestra',
    title: 'Registrar muestra',
    onClick: closeMenuAndNavigate('/dashboard/reception/register-sample'),
    divider: false,
  },
  {
    href: '#historial-atenciones',
    icon: <History size={20} className="admin-sidebar__nav-icon" />,
    label: 'Historial de atenciones',
    title: 'Historial de atenciones',
    onClick: closeMenuAndNavigate('/dashboard/reception/history'),
    divider: false,
  },
];
