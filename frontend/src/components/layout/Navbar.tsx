'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { timeAgo } from '../../utils/helpers';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="navbar bg-base-100/90 backdrop-blur-md border-b border-base-300/80 sticky top-0 z-30 px-4 lg:px-6 h-16">
      <div className="flex-1 flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="btn btn-ghost btn-square btn-sm lg:hidden text-base-content/70"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href="/overview" className="flex items-center gap-2.5 font-bold text-lg text-base-content">
          <div className="p-1.5 rounded-xl bg-primary text-primary-content shadow-sm shadow-primary/30">
            <Shield className="w-5 h-5" />
          </div>
          <span className="tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold">
            MailVault
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Security SaaS
          </span>
        </Link>
      </div>

      <div className="flex-none flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <div className="dropdown dropdown-end">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-ghost btn-circle btn-sm text-base-content/70 relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="badge badge-error badge-xs absolute -top-0.5 -right-0.5 text-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div
            tabIndex={0}
            className="dropdown-content z-50 menu p-0 shadow-xl bg-base-100 border border-base-300 rounded-2xl w-80 sm:w-96 mt-2 overflow-hidden"
          >
            <div className="p-4 border-b border-base-200 flex items-center justify-between bg-base-200/40">
              <span className="font-semibold text-sm">Security Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-base-200">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-base-content/60">
                  No notifications to display
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-base-200/50 cursor-pointer transition-colors ${
                      !n.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-primary">
                      {n.type === 'security_alert' ? (
                        <AlertCircle className="w-4 h-4 text-warning" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-base-content leading-tight">
                        {n.title}
                      </p>
                      <p className="text-xs text-base-content/70 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-base-content/40 mt-1 block">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar btn-sm">
            <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-2 z-50 p-2 shadow-xl bg-base-100 border border-base-300 rounded-2xl w-56 text-sm"
          >
            <li className="menu-title px-3 py-2 border-b border-base-200">
              <p className="font-semibold text-base-content truncate">{user?.name}</p>
              <p className="text-xs text-base-content/60 font-normal truncate">{user?.email}</p>
            </li>
            <li className="mt-1">
              <Link href="/profile" className="flex items-center gap-2.5 py-2">
                <User className="w-4 h-4 text-primary" /> Profile
              </Link>
            </li>
            <li>
              <Link href="/settings" className="flex items-center gap-2.5 py-2">
                <Settings className="w-4 h-4 text-secondary" /> Settings
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link href="/admin" className="flex items-center gap-2.5 py-2 text-warning">
                  <Shield className="w-4 h-4" /> Admin Console
                </Link>
              </li>
            )}
            <div className="divider my-1"></div>
            <li>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2.5 py-2 text-error hover:bg-error/10"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
