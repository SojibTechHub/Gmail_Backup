'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ShieldAlert, CheckCircle, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { timeAgo } from '../../utils/helpers';
import { EmptyState } from '../ui/EmptyState';

export function SecurityAlerts() {
  const { notifications, isLoading } = useNotifications();

  return (
    <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-base-content">Security Notifications</h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Live audit events & alerts for your vault
            </p>
          </div>
          <Link
            href="/settings"
            className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            Preferences <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="All clear"
            description="No recent security alerts or suspicious activities detected."
            className="border-none bg-transparent p-4"
          />
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <div
                key={n._id}
                className="p-3.5 rounded-2xl bg-base-200/50 border border-base-300/60 flex items-start gap-3"
              >
                <div className="mt-0.5 shrink-0">
                  {n.type === 'security_alert' ? (
                    <AlertCircle className="w-4 h-4 text-warning" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <p className="text-xs font-semibold text-base-content truncate">{n.title}</p>
                    <span className="text-[10px] text-base-content/50 shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/70 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
