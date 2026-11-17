'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { IRecoverySession, IEmailAccount } from '../../types';
import { getStatusBadge, timeAgo, getProviderName } from '../../utils/helpers';
import { EmptyState } from '../ui/EmptyState';

export function RecentActivities({ activities }: { activities?: IRecoverySession[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm h-full">
        <h3 className="text-base font-bold text-base-content mb-2">Recent Recovery Sessions</h3>
        <EmptyState
          icon={Clock}
          title="No recovery activities"
          description="You haven't initiated any account recovery attempts yet."
          className="border-none bg-transparent p-4"
        />
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 p-6 rounded-3xl shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-base-content">Recent Recovery Sessions</h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Live status of authorized account restoration procedures
            </p>
          </div>
          <Link
            href="/recovery/history"
            className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-base-200">
          {activities.map((session) => {
            const statusBadge = getStatusBadge(session.status);
            const account = session.accountId as IEmailAccount;
            const targetEmail = account?.email || 'Authorized Account';

            return (
              <div
                key={session._id || session.sessionId}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-base-200/40 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-base-content truncate">
                      {targetEmail}
                    </p>
                    <p className="text-xs text-base-content/60 truncate">
                      {getProviderName(session.provider)} &bull; {session.method.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`badge badge-sm font-medium ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                  <span className="text-[10px] text-base-content/50">
                    {timeAgo(session.startTime)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
