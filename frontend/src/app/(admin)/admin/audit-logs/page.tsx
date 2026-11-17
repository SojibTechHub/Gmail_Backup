'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../../../services/admin.service';
import { IAuditLog, AuditAction } from '../../../../types';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { Button } from '../../../../components/ui/Button';
import { formatDate, timeAgo } from '../../../../utils/helpers';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs({
        action: action || undefined,
        userId: userId || undefined,
      });
      setLogs(data.logs);
    } catch (err: unknown) {
      toast.error('Failed to query audit logs');
    } finally {
      setLoading(false);
    }
  }, [action, userId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns: Column<IAuditLog>[] = [
    {
      header: 'Timestamp',
      accessor: (row) => (
        <div>
          <p className="text-xs font-semibold text-base-content">{timeAgo(row.createdAt)}</p>
          <p className="text-[10px] text-base-content/50">{formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      header: 'Actor',
      accessor: (row) => {
        const user = row.userId as { name?: string; email?: string } | undefined;
        return (
          <div>
            <p className="text-xs font-medium text-base-content">{user?.name || 'Unknown'}</p>
            <p className="text-[10px] text-base-content/60">{user?.email || ''}</p>
          </div>
        );
      },
    },
    {
      header: 'Action',
      accessor: (row) => (
        <span className="badge badge-sm badge-neutral font-mono text-[10px] uppercase">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Resource',
      accessor: (row) => (
        <span className="text-xs font-mono text-base-content/80">
          {row.resource}
          {row.resourceId ? `:${row.resourceId.slice(0, 8)}...` : ''}
        </span>
      ),
    },
    {
      header: 'IP / Agent',
      accessor: (row) => (
        <div className="font-mono text-[10px] text-base-content/70">
          <p>{row.ipAddress}</p>
          <p className="text-base-content/40 truncate max-w-[120px]">{row.userAgent}</p>
        </div>
      ),
    },
    {
      header: 'Details',
      accessor: (row) => (
        <span className="text-xs text-base-content/80 line-clamp-1 max-w-sm">
          {row.details || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content font-medium mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
            Security Audit Logs
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Immutable 90-day forensic log of all authentication, account, recovery, and vault events
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchLogs}
          leftIcon={RefreshCw}
          className="border border-base-300"
        >
          Refresh Logs
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="card bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="select select-bordered select-sm rounded-xl text-xs w-60"
        >
          <option value="">All Audit Actions</option>
          <option value={AuditAction.USER_LOGIN}>USER_LOGIN</option>
          <option value={AuditAction.USER_REGISTER}>USER_REGISTER</option>
          <option value={AuditAction.ACCOUNT_ADD}>ACCOUNT_ADD</option>
          <option value={AuditAction.ACCOUNT_UPDATE}>ACCOUNT_UPDATE</option>
          <option value={AuditAction.ACCOUNT_DELETE}>ACCOUNT_DELETE</option>
          <option value={AuditAction.VAULT_ACCESS}>VAULT_ACCESS</option>
          <option value={AuditAction.VAULT_UPDATE}>VAULT_UPDATE</option>
          <option value={AuditAction.RECOVERY_START}>RECOVERY_START</option>
          <option value={AuditAction.RECOVERY_COMPLETE}>RECOVERY_COMPLETE</option>
          <option value={AuditAction.MFA_ENABLE}>MFA_ENABLE</option>
          <option value={AuditAction.PASSWORD_CHANGE}>PASSWORD_CHANGE</option>
        </select>

        {action && (
          <button
            type="button"
            onClick={() => setAction('')}
            className="btn btn-ghost btn-sm text-xs text-error gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyTitle="No audit logs found"
        emptyDescription="No events match your current filter selection."
      />
    </div>
  );
}
