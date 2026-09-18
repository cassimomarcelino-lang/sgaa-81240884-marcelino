'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Wrench,
  Droplets,
  CreditCard,
  BarChart3,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  History,
  GitBranch,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'nav-dashboard', label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'nav-clientes', label: 'Clientes', href: '/clientes', icon: <Users size={20} /> },
  { id: 'nav-pontos', label: 'Pontos de Abastecimento', href: '/pontos-abastecimento', icon: <MapPin size={20} /> },
  { id: 'nav-servicos', label: 'Serviços', href: '/servicos', icon: <Wrench size={20} /> },
  { id: 'nav-abastecimentos', label: 'Abastecimentos', href: '/supply-management', icon: <Droplets size={20} /> },
  { id: 'nav-pagamentos', label: 'Pagamentos', href: '/pagamentos', icon: <CreditCard size={20} /> },
  { id: 'nav-relatorios', label: 'Relatórios', href: '/relatorios', icon: <BarChart3 size={20} /> },
  { id: 'nav-changelog', label: 'Histórico', href: '/changelog', icon: <History size={20} /> },
  { id: 'nav-uml', label: 'Diagramas UML', href: '/uml', icon: <GitBranch size={20} /> },
  { id: 'nav-utilizadores', label: 'Utilizadores', href: '/utilizadores', icon: <UserCog size={20} />, adminOnly: true },
];

interface SidebarProps {
  userRole?: 'Administrador' | 'Funcionário';
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ userRole = 'Administrador', userName = 'Carlos Machava', userEmail = 'carlos@sgaa.co.mz' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const visibleItems = navItems.filter(item => !item.adminOnly || userRole === 'Administrador');

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  const SidebarContent = () => (
    <div className={`flex flex-col h-full bg-card border-r border-border sidebar-transition ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-border ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={32} />
          {!collapsed && (
            <span className="font-semibold text-base text-foreground truncate tracking-tight">SGAA</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
          aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p className="text-xs font-500 text-muted-foreground uppercase tracking-widest px-2 mb-2">Menu Principal</p>
        )}
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`group relative flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${active
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center tabular-nums">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                  {collapsed && (
                    <span className="sr-only">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-500 text-muted-foreground uppercase tracking-widest px-2 mb-2">Sistema</p>
          </div>
        )}
        {collapsed && <div className="mt-4 pt-4 border-t border-border" />}

        <ul className="space-y-0.5">
          <li>
            <button className={`group w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150`}>
              <Bell size={20} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 text-left">Notificações</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {userName.charAt(0)}
            </div>
            <Link href="/" className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors duration-150">
              <LogOut size={16} />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userRole}</p>
            </div>
            <Link
              href="/"
              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors duration-150 flex-shrink-0"
              title="Terminar sessão"
            >
              <LogOut size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="w-60 h-full">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile hamburger trigger (exported for use in Topbar) */}
      <button
        className="lg:hidden fixed top-4 left-4 z-30 w-9 h-9 bg-card border border-border rounded-lg flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Abrir menu"
      >
        <span className="sr-only">Menu</span>
        <div className="space-y-1">
          <span className="block w-4 h-0.5 bg-foreground" />
          <span className="block w-4 h-0.5 bg-foreground" />
          <span className="block w-3 h-0.5 bg-foreground" />
        </div>
      </button>
    </>
  );
}