'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, History, Play, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';
import recoveryService from '../../../../services/recovery.service';
import {
  IRecoverySession,
  IEmailAccount,
  EmailProvider,
  RecoverySessionStatus,
} from '../../../../types';
import { ProviderIcon } from '../../../../components/accounts/ProviderIcon';
import {
  getStatusBadge,
  getProviderName,
  formatDate,
  timeAgo,
} from '../../../../utils/helpers';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { Button } from '../../../../components/ui/Button';

export default function RecoveryHistoryPage() {
  const [sessions, setSessions] = useState<IRecoverySession[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recoveryService.getSessions({
        provider: provider || undefined,
        status: status || undefined,
      });
      setSessions(data.sessions);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch recovery history');
    } finally {
      setLoading(false);
    }
  }, [provider, status]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const columns: Column<IRecoverySession>[] = [
    {
      header: 'Account / Provider',
      accessor: (row) => {
        const account = row.accountId as IEmailAccount;
        return (
          <div className="flex items-center gap-2.5">
            <ProviderIcon provider={row.provider} size="sm" />
            <div className="min-w-0">
              <p className="font-semibold text-xs text-base-content truncate">
                {account?.email || 'Registered Account'}
              </p>
              <p className="text-[10px] text-base-content/50">{getProviderName(row.provider)}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Session ID',
      accessor: (row) => (
        <span className="font-mono text-xs text-base-content/70">
          {row.sessionId.slice(0, 10)}...
        </span>
      ),
    },
    {
      header: 'Recovery Method',
      accessor: (row) => (
        <span className="capitalize text-xs font-medium text-base-content">
          {row.method.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => {
        const badge = getStatusBadge(row.status);
        return <span className={`badge badge-sm font-semibold ${badge.className}`}>{badge.label}</span>;
      },
    },
    {
      header: 'Started',
      accessor: (row) => (
        <span className="text-xs text-base-content/70" title={formatDate(row.startTime)}>
          {timeAgo(row.startTime)}
        </span>
      ),
    },
    {
      header: 'Completed',
      accessor: (row) => (
        <span className="text-xs text-base-content/70">
          {row.completionTime ? formatDate(row.completionTime) : '—'}
        </span>
      ),
    },
    {
      header: 'User Notes',
      accessor: (row) => (
        <span className="text-xs text-base-content/70 italic line-clamp-1 max-w-xs">
          {row.notes || 'No notes'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/recovery"
            className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content font-medium mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Recovery Center
          </Link>
          <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
            Recovery History Audit Log
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Complete audit trail of all legitimate email recovery sessions and outcomes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchHistory}
            leftIcon={RefreshCw}
            className="text-base-content/70"
          >
            Refresh
          </Button>
          <Link href="/recovery">
            <Button variant="primary" size="sm" leftIcon={Play} className="font-semibold shadow-md">
              New Recovery
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="select select-bordered select-sm text-xs rounded-xl w-48"
        >
          <option value="">All Providers</option>
          <option value={EmailProvider.GMAIL}>Gmail</option>
          <option value={EmailProvider.OUTLOOK}>Outlook</option>
          <option value={EmailProvider.YAHOO}>Yahoo</option>
          <option value={EmailProvider.ICLOUD}>iCloud</option>
          <option value={EmailProvider.ZOHO}>Zoho</option>
          <option value={EmailProvider.PROTONMAIL}>Proton</option>
          <option value={EmailProvider.GMX}>GMX</option>
          <option value={EmailProvider.AOL}>AOL</option>
          <option value={EmailProvider.YANDEX}>Yandex</option>
          <option value={EmailProvider.CUSTOM}>Custom</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select select-bordered select-sm text-xs rounded-xl w-48"
        >
          <option value="">All Statuses</option>
          <option value={RecoverySessionStatus.COMPLETED}>Completed</option>
          <option value={RecoverySessionStatus.IN_PROGRESS}>In Progress</option>
          <option value={RecoverySessionStatus.AWAITING_VERIFICATION}>
            Awaiting Verification
          </option>
          <option value={RecoverySessionStatus.FAILED}>Failed</option>
          <option value={RecoverySessionStatus.CANCELLED}>Cancelled</option>
        </select>

        {(provider || status) && (
          <button
            type="button"
            onClick={() => {
              setProvider('');
              setStatus('');
            }}
            className="btn btn-ghost btn-sm text-xs text-error gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* History Table */}
      <DataTable
        columns={columns}
        data={sessions}
        loading={loading}
        emptyTitle="No recovery sessions recorded"
        emptyDescription="Your past email recovery attempts and outcomes will appear in this audit log."
      />
    </div>
  );
}
