'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mail,
  PlusCircle,
  ShieldCheck,
  History,
  Lock,
  Settings,
  User,
  ShieldAlert,
  Users,
  Database,
  FileText,
  Sliders,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const mainLinks = [
    { href: '/overview', label: 'Overview', icon: LayoutDashboard },
    { href: '/accounts', label: 'My Email Accounts', icon: Mail },
    { href: '/accounts/add', label: 'Add Email Account', icon: PlusCircle },
  ];

  const recoveryLinks = [
    { href: '/recovery', label: 'Recovery Center', icon: ShieldCheck },
    { href: '/recovery/history', label: 'Recovery History', icon: History },
  ];

  const securityLinks = [
    { href: '/vault', label: 'Security Vault', icon: Lock },
  ];

  const accountLinks = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin Dashboard', icon: ShieldAlert },
    { href: '/admin/users', label: 'User Directory', icon: Users },
    { href: '/admin/accounts', label: 'Global Accounts', icon: Database },
    { href: '/admin/audit-logs', label: 'Audit Trail', icon: FileText },
    { href: '/admin/settings', label: 'System Settings', icon: Sliders },
  ];

  const renderSection = (
    title: string,
    items: Array<{ href: string; label: string; icon: React.ElementType }>
  ) => (
    <div className="mb-6">
      <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-base-content/40 mb-2">
        {title}
      </p>
      <ul className="menu menu-sm p-0 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all',
                  isActive
                    ? 'bg-primary text-primary-content shadow-sm shadow-primary/20 font-semibold'
                    : 'text-base-content/70 hover:text-base-content hover:bg-base-200/80'
                )}
              >
                <Icon className={clsx('w-4 h-4', isActive ? 'text-white' : 'text-base-content/60')} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-base-100 border-r border-base-300/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-base-300/80 lg:hidden">
          <span className="font-bold text-base text-base-content">Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          {renderSection('Main Navigation', mainLinks)}
          {renderSection('Recovery Operations', recoveryLinks)}
          {renderSection('Encrypted Storage', securityLinks)}
          {renderSection('User Account', accountLinks)}
          {isAdmin && renderSection('Administration', adminLinks)}
        </div>

        {/* Security Status Footer in Sidebar */}
        <div className="p-4 border-t border-base-300/80 bg-base-200/30">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-success/10 border border-success/20 text-success text-xs">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium">AES-256-GCM Vault Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
