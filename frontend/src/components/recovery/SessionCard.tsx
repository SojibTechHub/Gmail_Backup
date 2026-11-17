'use client';

import React from 'react';
import { ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { IRecoverySession, IEmailAccount } from '../../types';
import { getStatusBadge, getProviderName, formatDate, timeAgo } from '../../utils/helpers';
import { ProviderIcon } from '../accounts/ProviderIcon';

export function SessionCard({ session }: { session: IRecoverySession }) {
  const account = session.accountId as IEmailAccount;
  const statusBadge = getStatusBadge(session.status);

  return (
    <div className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <ProviderIcon provider={session.provider} size="sm" />
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-base-content truncate">
              {account?.email || 'Registered Account'}
            </h4>
            <p className="text-xs text-base-content/60 truncate">
              Session ID: <span className="font-mono">{session.sessionId.slice(0, 8)}...</span>
            </p>
          </div>
        </div>

        <span className={`badge badge-sm font-semibold shrink-0 ${statusBadge.className}`}>
          {statusBadge.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-base-content/70 py-2 border-t border-b border-base-200 my-2">
        <div>
          <span className="text-[10px] text-base-content/50 uppercase block">Method</span>
          <span className="font-medium capitalize text-base-content">
            {session.method.replace(/_/g, ' ')}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-base-content/50 uppercase block">Started</span>
          <span className="font-medium text-base-content">{timeAgo(session.startTime)}</span>
        </div>
      </div>

      {session.notes && (
        <p className="text-xs text-base-content/80 line-clamp-2 italic bg-base-200/50 p-2 rounded-xl mt-2">
          &ldquo;{session.notes}&rdquo;
        </p>
      )}

      {session.completionTime && (
        <span className="text-[10px] text-base-content/40 mt-2 block">
          Completed at: {formatDate(session.completionTime)}
        </span>
      )}
    </div>
  );
}
